"""
EnbrioAtlas music, rendered offline (numpy + scipy, ffmpeg to encode).

  python scripts/intro-v3/music.py            # everything
  python scripts/intro-v3/music.py score      # only the opening film's score

Outputs:
  public/intro-v3/score.{ogg,mp3}   the opening show's score, 24 s at 120 bpm: its cuts are the timeline in
                                    components/onboarding/show/intro.ts (T): words 0-4, zygote 4, divisions 4.5-6,
                                    drop 8 (embryo), 12 (skull), 16 (face), fusion 17-19.7, 20 (wordmark)
  public/music/{argia,itsasoa,goiza}.{ogg,mp3}   calm study pieces, 2-2.5 min each, played one after another
"""
import os
import subprocess
import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt, sosfilt_zi

SR = 44100
RNG = np.random.default_rng(7)
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))


def hz(note):
    """'A4' / 'C#5' / 'Bb3' -> Hz."""
    names = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
    n = names[note[0]]
    rest = note[1:]
    if rest[0] in '#b':
        n += 1 if rest[0] == '#' else -1
        rest = rest[1:]
    octave = int(rest)
    midi = 12 * (octave + 1) + n
    return 440.0 * 2 ** ((midi - 69) / 12)


def chord(*notes):
    return [hz(n) for n in notes]


class Mix:
    """A stereo bus with a reverb send."""

    def __init__(self, seconds):
        self.n = int(seconds * SR) + SR * 8
        self.dry = np.zeros((self.n, 2), np.float32)
        self.wet = np.zeros((self.n, 2), np.float32)

    def add(self, sig, at, gain=1.0, pan=0.0, send=0.25):
        i = max(0, int(at * SR))
        if i >= self.n:
            return
        sig = sig[: self.n - i]
        l = np.cos((pan + 1) * np.pi / 4) * gain
        r = np.sin((pan + 1) * np.pi / 4) * gain
        if sig.ndim == 1:
            st = np.stack([sig * l, sig * r], 1)
        else:
            st = sig * np.array([l, r]) * 1.4142
        self.dry[i : i + len(sig)] += st
        if send:
            self.wet[i : i + len(sig)] += st * send


# ———————————————————————————— sounds ————————————————————————————


def env(n, a=0.005, d=0.0, s=1.0, r=0.05, hold=None):
    """Attack, decay to sustain, hold, release (seconds); n samples."""
    t = np.arange(n) / SR
    e = np.ones(n)
    ai = max(1, int(a * SR))
    e[:ai] = np.linspace(0, 1, ai) ** 1.5
    if d > 0:
        dd = (t - a) / d
        m = t >= a
        e[m] = s + (1 - s) * np.exp(-dd[m] * 3)
    ri = int(r * SR)
    if ri > 0 and ri < n:
        e[-ri:] *= np.linspace(1, 0, ri) ** 2
    return e


def lowpass(x, cut, order=2):
    sos = butter(order, min(cut, SR * 0.45), 'low', fs=SR, output='sos')
    return sosfilt(sos, x, axis=0)


def highpass(x, cut, order=2):
    sos = butter(order, cut, 'high', fs=SR, output='sos')
    return sosfilt(sos, x, axis=0)


def bandpass(x, lo, hi, order=2):
    sos = butter(order, [lo, min(hi, SR * 0.45)], 'band', fs=SR, output='sos')
    return sosfilt(sos, x, axis=0)


def sweep_lowpass(x, cuts, block=512, order=2):
    """Low-pass whose cut-off follows `cuts` (one value per block)."""
    out = np.zeros_like(x)
    zi = None
    for b in range(0, len(x), block):
        c = cuts[min(b // block, len(cuts) - 1)]
        sos = butter(order, float(np.clip(c, 40, SR * 0.45)), 'low', fs=SR, output='sos')
        if zi is None:
            zi = np.zeros((sos.shape[0], 2) + x.shape[1:])
        out[b : b + block], zi = sosfilt(sos, x[b : b + block], axis=0, zi=zi)
    return out


def epiano(f, dur, vel=0.7, bright=1.0):
    """A tine electric piano (FM): a soft bell attack, then a warm decaying tone."""
    n = int((dur + 1.6) * SR)
    t = np.arange(n) / SR
    tau = 2.2 * (220 / f) ** 0.35
    amp = np.exp(-t / tau) * env(n, 0.002, r=0.25)
    rel = int(dur * SR)
    if rel < n:
        amp[rel:] *= np.exp(-np.arange(n - rel) / SR / 0.18)
    index = (0.6 + 2.6 * vel * bright) * np.exp(-t / 0.35) + 0.25
    mod = np.sin(2 * np.pi * f * t) * index
    tone = np.sin(2 * np.pi * f * t + mod)
    tine = np.sin(2 * np.pi * f * 7.02 * t) * np.exp(-t / 0.05) * 0.18 * vel
    bark = np.tanh(tone * (1 + vel)) * 0.6 + tone * 0.4
    return ((bark + tine) * amp * vel).astype(np.float32)


def felt_piano(f, dur, vel=0.6):
    """A soft felt piano: few partials, slightly stretched, gentle attack."""
    n = int((dur + 2.5) * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k, (g, decay) in enumerate([(1, 3.2), (0.42, 1.8), (0.18, 1.1), (0.08, 0.7), (0.04, 0.45)], 1):
        fk = f * k * (1 + 0.0004 * k * k)
        if fk > 12000:
            break
        out += g * np.sin(2 * np.pi * fk * t + RNG.random() * 6) * np.exp(-t / (decay * (260 / f) ** 0.4))
    out *= env(n, 0.006, r=0.4)
    rel = int((dur + 0.3) * SR)
    if rel < n:
        out[rel:] *= np.exp(-np.arange(n - rel) / SR / 0.35)
    hammer = lowpass(RNG.standard_normal(n) * np.exp(-t / 0.008), 2500) * 0.05
    return ((out + hammer) * vel).astype(np.float32)


def bell(f, dur=3.0, vel=0.6):
    """A glass bell: inharmonic partials, long shimmer."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for ratio, g, decay in [(1, 1, 2.4), (2.01, 0.5, 1.4), (2.76, 0.32, 1.0), (5.4, 0.16, 0.5), (8.93, 0.06, 0.25)]:
        out += g * np.sin(2 * np.pi * f * ratio * t + RNG.random() * 6) * np.exp(-t / decay)
    out *= env(n, 0.001, r=0.3)
    return (out * vel).astype(np.float32)


def saw(f, n, detune_cents=0.0, phase=None):
    t = np.arange(n) / SR
    ff = f * 2 ** (detune_cents / 1200)
    p = (ff * t + (RNG.random() if phase is None else phase)) % 1.0
    return 2 * p - 1


def pad(freqs, dur, attack=1.2, release=1.8, cut0=900, cut1=None, vel=0.5, width=0.7):
    """Warm analogue pad: three detuned saws per note, low-passed, slow envelope; stereo."""
    n = int((dur + release) * SR)
    left = np.zeros(n)
    right = np.zeros(n)
    for f in freqs:
        for dc, pan in [(-7, -width), (0, 0), (7, width)]:
            s = saw(f, n, dc)
            l = np.cos((pan + 1) * np.pi / 4)
            r = np.sin((pan + 1) * np.pi / 4)
            left += s * l
            right += s * r
    cuts = np.linspace(cut0, cut1 or cut0, n // 512 + 1)
    st = np.stack([left, right], 1) / (len(freqs) * 2.2)
    st = sweep_lowpass(st, cuts, order=2)
    st = highpass(st, 120)
    e = env(n, attack, r=release)
    return (st * e[:, None] * vel).astype(np.float32)


def pluck(f, dur=0.35, vel=0.5, cut=3000):
    """A short synth pluck (arpeggios): saw through a closing low-pass."""
    n = int((dur + 0.3) * SR)
    s = saw(f, n, 0) * 0.6 + saw(f, n, 6) * 0.4
    cuts = cut * np.exp(-np.arange(n // 256 + 1) * 256 / SR / 0.09) + 300
    s = sweep_lowpass(s, cuts, block=256)
    return (s * env(n, 0.002, r=0.12) * np.exp(-np.arange(n) / SR / (dur * 0.7)) * vel).astype(np.float32)


def sub(f, dur, vel=0.6):
    n = int((dur + 0.2) * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(4 * np.pi * f * t)
    return (np.tanh(s * 1.4) * env(n, 0.01, r=0.15) * vel).astype(np.float32)


def bass(f, dur, vel=0.6):
    """Round bass: sine plus a little filtered saw."""
    n = int((dur + 0.15) * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.25 * lowpass(saw(f, n), 600)
    return (np.tanh(s * 1.2) * env(n, 0.006, r=0.08) * np.exp(-t / 1.4) * vel).astype(np.float32)


def kick(vel=1.0, soft=False):
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    f = 46 + (130 if not soft else 80) * np.exp(-t / 0.045)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / (0.32 if not soft else 0.22))
    click = lowpass(RNG.standard_normal(n), 4000) * np.exp(-t / 0.004) * (0.25 if not soft else 0.08)
    return (np.tanh((body + click) * 1.6) * vel).astype(np.float32)


def snare(vel=0.6, soft=False):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    noise = bandpass(RNG.standard_normal(n), 1200 if not soft else 900, 7000 if not soft else 4200) * np.exp(-t / (0.13 if not soft else 0.1))
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.05)
    return ((noise * 0.8 + tone * 0.5) * vel).astype(np.float32)


def clap(vel=0.6):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    e = np.zeros(n)
    for d in (0, 0.011, 0.022):
        i = int(d * SR)
        e[i:] += np.exp(-(t[: n - i]) / 0.007)
    e += np.exp(-t / 0.12) * 0.6
    return (bandpass(RNG.standard_normal(n), 900, 5000) * e * vel * 0.6).astype(np.float32)


def hat(vel=0.3, open_=False):
    n = int((0.35 if open_ else 0.09) * SR)
    t = np.arange(n) / SR
    return (highpass(RNG.standard_normal(n), 7000) * np.exp(-t / (0.12 if open_ else 0.022)) * vel).astype(np.float32)


def shaker(vel=0.2):
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    e = (t / 0.02) * np.exp(1 - t / 0.02)
    return (bandpass(RNG.standard_normal(n), 4000, 11000) * e * vel).astype(np.float32)


def boom(vel=1.0, dur=2.8):
    """An impact: a deep falling sine and a dark noise burst."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 32 + 40 * np.exp(-t / 0.25)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 1.1)
    dust = lowpass(RNG.standard_normal(n), 700) * np.exp(-t / 0.35) * 0.45
    return (np.tanh((body + dust) * 1.5) * vel).astype(np.float32)


def crash(vel=0.4, dur=3.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = highpass(RNG.standard_normal((n, 2)), 3500) * np.exp(-t / 1.1)[:, None]
    return (s * vel).astype(np.float32)


def riser(dur, vel=0.5, lo=200, hi=9000):
    """Noise rising through a band (and a sine glide), growing to its end."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    k = t / dur
    noise = RNG.standard_normal((n, 2))
    cuts = lo * (hi / lo) ** (np.arange(n // 512 + 1) * 512 / n)
    s = sweep_lowpass(noise, cuts, order=2)
    s = highpass(s, 150)
    f = 110 * 2 ** (k * 3)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.2
    amp = k**2.2
    return ((s * 0.6 + tone[:, None]) * amp[:, None] * vel).astype(np.float32)


def reverse_swell(freqs, dur, vel=0.4):
    """A chord heard backwards: it swells into the next downbeat."""
    p = pad(freqs, dur, attack=0.01, release=0.01, cut0=2500, vel=1)
    rev = p[::-1] * (np.linspace(0, 1, len(p)) ** 2.5)[:, None]
    return (rev * vel).astype(np.float32)


def crackle(seconds, vel=0.05):
    """Vinyl: soft hiss and sparse clicks."""
    n = int(seconds * SR)
    hiss = lowpass(RNG.standard_normal(n), 3000) * 0.08
    clicks = np.zeros(n)
    idx = RNG.integers(0, n, int(seconds * 7))
    clicks[idx] = RNG.standard_normal(len(idx)) * 0.9
    clicks = bandpass(clicks, 1500, 9000)
    return ((hiss + clicks) * vel).astype(np.float32)


def impulse(seconds=3.2, bright=6000, dark=1800):
    """A stereo hall: decorrelated noise, decaying, darker as it fades."""
    n = int(seconds * SR)
    t = np.arange(n) / SR
    decay = np.exp(-t * 6.91 / seconds)
    noise = RNG.standard_normal((n, 2))
    b = lowpass(noise, bright)
    d = lowpass(noise, dark)
    mix = np.clip(t / (seconds * 0.6), 0, 1)[:, None]
    ir = (b * (1 - mix) + d * mix) * decay[:, None]
    pre = int(0.018 * SR)
    ir = np.concatenate([np.zeros((pre, 2)), ir])
    return (ir / np.sqrt((ir**2).sum() / 2)).astype(np.float32)


def master(m: Mix, seconds, ir_seconds=3.2, wet=0.32, peak_db=-1.5, rms_db=None, fade_out=None):
    ir = impulse(ir_seconds)
    wetL = fftconvolve(m.wet[:, 0], ir[:, 0])[: m.n]
    wetR = fftconvolve(m.wet[:, 1], ir[:, 1])[: m.n]
    out = m.dry + np.stack([wetL, wetR], 1) * wet
    out = highpass(out, 28)
    end = int(seconds * SR)
    out = out[:end]
    if fade_out:
        k = int(fade_out * SR)
        out[-k:] *= (np.linspace(1, 0, k) ** 1.6)[:, None]
    # Level first (loud parts at about half scale), then a soft knee for the few peaks above, then the ceiling.
    out /= np.percentile(np.abs(out), 99.7) / 0.42 + 1e-9
    out = np.where(np.abs(out) < 0.5, out, np.sign(out) * (0.5 + 0.5 * np.tanh((np.abs(out) - 0.5) / 0.5)))
    if rms_db is not None:
        rms = np.sqrt(np.mean(out**2)) + 1e-9
        out *= min(10 ** (rms_db / 20) / rms, 10 ** (peak_db / 20) / (np.max(np.abs(out)) + 1e-9))
    else:
        out *= 10 ** (peak_db / 20) / (np.max(np.abs(out)) + 1e-9)
    return out.astype(np.float32)


def save(out, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    wav = path + '.wav'
    wavfile.write(wav, SR, (out * 32767).astype(np.int16))
    for ext, args in [('ogg', ['-c:a', 'libvorbis', '-q:a', '5']), ('mp3', ['-c:a', 'libmp3lame', '-b:a', '160k'])]:
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, *args, f'{path}.{ext}'], check=True)
    os.remove(wav)
    print('wrote', path, f'{len(out) / SR:.1f}s')


def human(x=0.008):
    return float(RNG.normal(0, x))


# ———————————————————————————— the opening score ————————————————————————————


def score():
    """24 s, 120 bpm (a beat 0.5 s, a bar 2 s), A major."""
    L = 24.6
    m = Mix(L)
    A = chord('A2', 'E3', 'A3', 'C#4', 'E4', 'B4')
    Fm = chord('F#2', 'C#3', 'A3', 'C#4', 'E4', 'G#4')
    D = chord('D2', 'A2', 'F#3', 'A3', 'C#4', 'E4')
    E = chord('E2', 'B2', 'G#3', 'B3', 'E4', 'F#4')
    Bm = chord('B1', 'F#2', 'D3', 'A3', 'C#4', 'F#4')
    Csm = chord('C#2', 'G#2', 'E3', 'B3', 'E4', 'G#4')
    Amaj9 = chord('A1', 'A2', 'E3', 'G#3', 'B3', 'C#4', 'E4', 'G#4', 'B4')

    # 0-4: the words write themselves. A low bed, a few soft keys, glints as the letters land.
    m.add(pad(D, 4.2, attack=1.5, release=1.0, cut0=500, cut1=1100, vel=0.26), 0.0, send=0.5)
    m.add(sub(hz('D2'), 3.9, 0.12), 0.1, send=0)
    for at, n, v in [(0.35, 'F#5', 0.38), (0.85, 'C#5', 0.3), (1.35, 'A4', 0.3), (1.6, 'B4', 0.26), (2.1, 'C#5', 0.32), (2.6, 'E5', 0.3)]:
        m.add(epiano(hz(n), 0.6, v, 0.8), at + human(0.004), gain=0.5, pan=RNG.uniform(-0.4, 0.4), send=0.55)
    for i in range(34):
        at = 0.3 + i * 0.07 + RNG.uniform(0, 0.05)
        m.add(bell(hz(RNG.choice(['A6', 'C#7', 'E7', 'B6', 'F#7'])), 0.8, 0.05 + 0.04 * RNG.random()), at, pan=RNG.uniform(-0.8, 0.8), send=0.7)
    # 2.9-4: the words lift: a riser and the chord heard backwards into the downbeat.
    m.add(riser(1.1, 0.35, 300, 7000), 2.9, send=0.3)
    m.add(reverse_swell(A, 1.6, 0.5), 2.4, send=0.2)

    # 4: the zygote. A deep hit, the chord opens.
    m.add(boom(0.55), 4.0, send=0.25)
    m.add(pad(A, 4.0, attack=0.05, release=1.2, cut0=1800, cut1=900, vel=0.2), 4.0, send=0.45)
    m.add(sub(hz('A1'), 3.9, 0.2), 4.0, send=0)
    # Divisions on the beats: 2, 4, 8, 16 — rising bells, left, right, left, right.
    for i, (at, n) in enumerate(zip([4.5, 5.0, 5.5, 6.0], ['A5', 'C#6', 'E6', 'A6'])):
        m.add(bell(hz(n), 2.6, 0.3), at, pan=-0.45 if i % 2 == 0 else 0.45, send=0.5)
        m.add(bell(hz(n) / 2, 1.6, 0.16), at, pan=0, send=0.4)
        m.add(kick(0.35, soft=True), at, send=0.05)
    # The pulse begins: an arpeggio growing to the drop.
    arp = ['A3', 'E4', 'A4', 'C#5', 'E5', 'C#5', 'A4', 'E4']
    for i in range(16):
        at = 4.0 + i * 0.25
        k = i / 16
        m.add(pluck(hz(arp[i % 8]), 0.22, 0.07 + 0.13 * k, cut=900 + 2500 * k), at, pan=0.3 * np.sin(i), send=0.35)
    arp2 = ['F#3', 'C#4', 'F#4', 'A4', 'C#5', 'A4', 'F#4', 'C#4']
    for i in range(16):
        at = 6.0 + i * 0.125
        k = 0.5 + i / 32
        m.add(pluck(hz(arp2[(i // 2) % 8]), 0.15, 0.07 + 0.15 * k, cut=1500 + 3500 * k), at, pan=0.35 * np.sin(i * 1.3), send=0.3)
    m.add(pad(Fm, 2.0, attack=0.4, release=0.4, cut0=700, cut1=3200, vel=0.22), 6.0, send=0.4)
    # The build: snare roll and a riser into the drop.
    for i in range(16):
        at = 7.0 + i * 0.0625
        m.add(snare(0.08 + 0.3 * (i / 16) ** 2), at, pan=0.1, send=0.25)
    m.add(riser(2.0, 0.4), 6.0, send=0.3)

    # 8-16: the drop. Embryo (8-12), skull (12-16). A, F#m, D, E: one chord a bar.
    prog = [(8, A, 'A1'), (10, Fm, 'F#1'), (12, D, 'D2'), (14, E, 'E2')]
    for at, c, root in prog:
        m.add(pad(c, 2.0, attack=0.02, release=0.6, cut0=2400, cut1=1500, vel=0.42), at, send=0.4)
        for b in range(8):
            m.add(bass(hz(root) * (2 if b % 4 == 3 else 1), 0.22, 0.34), at + b * 0.25, send=0)
        for b in range(8):
            notes = c[2:]
            m.add(pluck(notes[(b * 3) % len(notes)] * 2, 0.18, 0.3, cut=4000), at + b * 0.25, pan=0.4 * np.sin(b * 2.1 + at), send=0.3)
    for at in (8.0, 12.0):
        m.add(boom(0.6), at, send=0.3)
        m.add(crash(0.32), at, send=0.4)
    for bar in range(4):
        b0 = 8 + bar * 2
        for beat, kind in [(0, 'k'), (0.5, 'c'), (1.0, 'k'), (1.25, 'k'), (1.5, 'c')]:
            if kind == 'k':
                m.add(kick(0.7), b0 + beat, send=0.03)
            else:
                m.add(clap(0.75), b0 + beat, pan=0.05, send=0.35)
        for h in range(8):
            m.add(hat(0.16 + 0.08 * (h % 2 == 1)), b0 + h * 0.25 + human(0.004), pan=0.35, send=0.1)
    # A short melody on top for the skull (12-16).
    for at, n in [(12.0, 'E5'), (12.5, 'C#5'), (13.0, 'F#5'), (13.75, 'E5'), (14.0, 'G#5'), (14.5, 'F#5'), (15.0, 'E5'), (15.5, 'B4')]:
        m.add(epiano(hz(n), 0.45, 0.6), at + human(0.005), gain=0.6, pan=-0.2, send=0.45)

    # 16-20: the face fuses. Drums out; shimmer; a rising progression into the last downbeat.
    m.add(boom(0.4), 16.0, send=0.4)
    for at, c in [(16.0, Bm), (17.0, Bm), (18.0, Csm), (19.0, D)]:
        m.add(pad(c, 1.0, attack=0.3, release=0.8, cut0=1200, cut1=2600, vel=0.42), at, send=0.55)
    shimmer = ['B5', 'F#5', 'D6', 'C#6', 'A5', 'F#6', 'E6', 'C#6']
    for i in range(32):
        at = 16.0 + i * 0.125
        m.add(bell(hz(shimmer[i % 8]), 1.0, 0.1 + 0.08 * (i / 32)), at, pan=0.6 * np.sin(i * 0.9), send=0.6)
    for i in range(8):
        m.add(kick(0.3 + 0.04 * i, soft=True), 16.0 + i * 0.5, send=0.05)
    for i in range(24):
        at = 18.5 + i * 0.05
        m.add(snare(0.05 + 0.3 * (i / 24) ** 2), at, pan=-0.1, send=0.3)
    m.add(riser(2.2, 0.6, 250, 10000), 17.8, send=0.35)
    m.add(reverse_swell(Amaj9, 1.4, 0.5), 18.6, send=0.2)

    # 20: the wordmark. The whole chord, a deep hit, the bells; then it rings out.
    m.add(boom(0.65, 4.0), 20.0, send=0.4)
    m.add(crash(0.35, 4.5), 20.0, send=0.5)
    m.add(pad(Amaj9, 3.6, attack=0.02, release=2.0, cut0=3000, cut1=900, vel=0.42), 20.0, send=0.6)
    m.add(sub(hz('A1'), 3.4, 0.25), 20.0, send=0)
    for i, n in enumerate(['A4', 'C#5', 'E5', 'G#5', 'B5', 'E6']):
        m.add(epiano(hz(n), 2.6, 0.5), 20.0 + i * 0.045, gain=0.5, pan=-0.5 + i * 0.2, send=0.6)
    for i, n in enumerate(['E6', 'G#6', 'B6', 'C#7']):
        m.add(bell(hz(n), 3.5, 0.25), 20.0 + 0.6 + i * 0.25, pan=0.6 * (-1) ** i, send=0.7)
    m.add(bell(hz('A6'), 3.0, 0.3), 21.4, pan=0, send=0.7)
    out = master(m, L, ir_seconds=3.4, wet=0.34, fade_out=1.6)
    save(out, os.path.join(ROOT, 'public', 'intro-v3', 'score'))


# ———————————————————————————— study pieces ————————————————————————————


def lofi(name, bpm, bars, prog, key_notes, mood):
    """
    A calm lo-fi piece: Rhodes chords, round bass, soft swung drums (in and out by section), vinyl, a sparse melody.
    `prog`: list of (chord notes, bass note) one per bar, cycled. `mood`: sections as (bars, drums, melody).
    """
    beat = 60 / bpm
    bar = beat * 4
    total = bars * bar + 4
    m = Mix(total)
    m.add(crackle(total, 0.045), 0, send=0)
    swing = beat * 0.5 * 0.16
    b = 0
    for sec_bars, drums, melody in mood:
        for i in range(sec_bars):
            at = b * bar
            notes, root = prog[b % len(prog)]
            c = chord(*notes)
            # Rhodes: on 1, and pushed a little before 3; voiced soft, a hair of strum.
            for hit, dur, v in [(0, beat * 1.8, 0.42), (beat * 2.5, beat * 1.4, 0.32)]:
                for j, f in enumerate(c):
                    m.add(epiano(f, dur, v * RNG.uniform(0.85, 1.05), 0.55), at + hit + j * 0.012 + human(0.006), gain=0.32, pan=-0.35 + 0.7 * j / max(1, len(c) - 1), send=0.35)
            m.add(pad(c, bar, attack=1.0, release=1.2, cut0=700, vel=0.12, width=0.9), at, send=0.5)
            m.add(bass(hz(root), beat * 1.6, 0.55), at + human(0.004), send=0)
            m.add(bass(hz(root) * (1.5 if b % 2 else 1), beat * 0.9, 0.42), at + beat * 2.5 + human(0.004), send=0)
            if drums:
                m.add(kick(0.62, soft=True), at, send=0.02)
                m.add(kick(0.45, soft=True), at + beat * 2.5, send=0.02)
                for s in (1, 3):
                    m.add(snare(0.3, soft=True), at + beat * s + human(0.006), pan=0.05, send=0.2)
                for h in range(8):
                    sw = swing if h % 2 else 0
                    m.add(hat(0.06 + 0.035 * (h % 2 == 0)), at + h * beat / 2 + sw + human(0.004), pan=0.3, send=0.08)
                if b % 2:
                    m.add(shaker(0.08), at + beat * 3.5 + swing, pan=-0.4, send=0.1)
            if melody:
                # A few notes from the key, in the gaps.
                for k in range(RNG.integers(2, 5)):
                    pos = RNG.choice([0.5, 1.0, 1.5, 2.0, 3.0, 3.5])
                    n = hz(RNG.choice(key_notes))
                    voice = felt_piano if mood is not None and melody == 'piano' else epiano
                    sig = voice(n, beat * 0.9, 0.45) if voice is felt_piano else epiano(n, beat * 0.8, 0.45, 0.9)
                    m.add(sig, at + pos * beat + human(0.01), gain=0.35, pan=RNG.uniform(-0.5, 0.5), send=0.5)
            b += 1
    out = master(m, total, ir_seconds=2.6, wet=0.3, rms_db=-21, fade_out=4.5)
    save(out, os.path.join(ROOT, 'public', 'music', name))


def ambient(name, seconds, prog, key_notes):
    """No drums: slow pads, a felt piano, long reverb (D major)."""
    m = Mix(seconds)
    m.add(crackle(seconds, 0.02), 0, send=0)
    t = 0.0
    i = 0
    seg = 8.0
    while t < seconds - 4:
        notes = prog[i % len(prog)]
        c = chord(*notes)
        m.add(pad(c, seg, attack=2.8, release=3.5, cut0=600, cut1=1100, vel=0.2, width=0.95), t, send=0.6)
        m.add(sub(c[0], seg - 0.5, 0.18), t + 0.5, send=0)
        # A slow broken chord on the felt piano.
        for j, f in enumerate(c[1:]):
            m.add(felt_piano(f * 2, 2.5, 0.32 * RNG.uniform(0.8, 1.1)), t + 0.3 + j * 0.95 + human(0.02), gain=0.5, pan=-0.4 + 0.2 * j, send=0.6)
        if i % 2 == 1:
            for k in range(3):
                m.add(felt_piano(hz(RNG.choice(key_notes)), 1.6, 0.3), t + 4.5 + k * 1.1 + human(0.03), gain=0.45, pan=RNG.uniform(-0.6, 0.6), send=0.7)
        if i % 4 == 2:
            m.add(bell(hz(RNG.choice(key_notes)) * 2, 4.0, 0.08), t + 2.0, pan=0.5, send=0.8)
        t += seg
        i += 1
    out = master(m, seconds, ir_seconds=4.5, wet=0.42, rms_db=-23, fade_out=6)
    save(out, os.path.join(ROOT, 'public', 'music', name))


def pieces():
    # Argia: A major, 76 bpm.
    argia_prog = [
        (('A3', 'C#4', 'E4', 'G#4'), 'A1'),
        (('F#3', 'A3', 'C#4', 'E4'), 'F#1'),
        (('D3', 'F#3', 'A3', 'C#4', 'E4'), 'D2'),
        (('E3', 'A3', 'B3', 'D4'), 'E2'),
        (('C#3', 'E3', 'G#3', 'B3'), 'C#2'),
        (('F#3', 'A3', 'C#4', 'E4'), 'F#1'),
        (('D3', 'F#3', 'A3', 'C#4'), 'D2'),
        (('E3', 'G#3', 'B3', 'D4'), 'E2'),
    ]
    lofi('argia', 76, 48, argia_prog, ['C#5', 'E5', 'F#5', 'A5', 'B4', 'G#5'], [(8, False, False), (16, True, False), (12, True, 'keys'), (8, False, 'piano'), (4, True, False)])
    # Goiza: F major, 82 bpm.
    goiza_prog = [
        (('F3', 'A3', 'C4', 'E4'), 'F1'),
        (('E3', 'G3', 'B3', 'D4'), 'E2'),
        (('D3', 'F3', 'A3', 'C4', 'E4'), 'D2'),
        (('C3', 'E3', 'G3', 'B3', 'D4'), 'C2'),
        (('Bb2', 'D3', 'F3', 'A3'), 'Bb1'),
        (('A2', 'C3', 'E3', 'G3'), 'A1'),
        (('D3', 'F3', 'A3', 'C4'), 'D2'),
        (('G2', 'Bb2', 'D3', 'F3', 'A3'), 'G1'),
    ]
    lofi('goiza', 82, 52, goiza_prog, ['A4', 'C5', 'D5', 'E5', 'G5', 'F5'], [(4, False, False), (16, True, False), (16, True, 'keys'), (8, False, 'piano'), (8, True, False)])
    # Itsasoa: D major, no drums.
    ambient(
        'itsasoa',
        150,
        [('D2', 'A3', 'D4', 'F#4', 'C#5'), ('B1', 'F#3', 'B3', 'D4', 'A4'), ('G1', 'D3', 'B3', 'D4', 'F#4'), ('A1', 'E3', 'A3', 'C#4', 'E4')],
        ['D5', 'E5', 'F#5', 'A5', 'B5', 'C#6'],
    )


if __name__ == '__main__':
    which = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if which in ('all', 'score'):
        score()
    if which in ('all', 'pieces'):
        pieces()
