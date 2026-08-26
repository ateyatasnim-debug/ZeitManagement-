import type { SoundscapeId } from '../types'

/**
 * All soundscapes are synthesized locally with the Web Audio API (noise +
 * filters), so the app works fully offline and ships no copyrighted audio.
 */
class SoundscapeEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private nodes: AudioNode[] = []
  private current: SoundscapeId = 'none'

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = 0.5
      this.masterGain.connect(this.ctx.destination)
    }
    return this.ctx
  }

  private makeNoiseBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let lastOut = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      // brownian-ish smoothing for a softer, less hissy base texture
      lastOut = (lastOut + 0.02 * white) / 1.02
      data[i] = lastOut * 3.5
    }
    return buffer
  }

  private stopAll() {
    for (const n of this.nodes) {
      try {
        ;(n as any).stop?.()
      } catch {
        /* noop */
      }
      n.disconnect()
    }
    this.nodes = []
  }

  setVolume(v: number) {
    if (this.masterGain) this.masterGain.gain.value = Math.max(0, Math.min(1, v))
  }

  async play(id: SoundscapeId) {
    const ctx = this.ensureContext()
    if (ctx.state === 'suspended') await ctx.resume()
    this.stopAll()
    this.current = id
    if (id === 'none') return

    const noiseBuffer = this.makeNoiseBuffer(ctx)
    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = noiseBuffer
    noiseSource.loop = true
    this.nodes.push(noiseSource)

    const filter = ctx.createBiquadFilter()
    this.nodes.push(filter)

    switch (id) {
      case 'whitenoise': {
        filter.type = 'allpass'
        noiseSource.connect(filter)
        filter.connect(this.masterGain!)
        break
      }
      case 'rain': {
        filter.type = 'highpass'
        filter.frequency.value = 900
        const lp = ctx.createBiquadFilter()
        lp.type = 'lowpass'
        lp.frequency.value = 6000
        this.nodes.push(lp)
        noiseSource.connect(filter)
        filter.connect(lp)
        lp.connect(this.masterGain!)
        this.addDrips(ctx)
        break
      }
      case 'cafe': {
        filter.type = 'bandpass'
        filter.frequency.value = 500
        filter.Q.value = 0.5
        noiseSource.connect(filter)
        filter.connect(this.masterGain!)
        this.addMurmur(ctx)
        break
      }
      case 'forest': {
        filter.type = 'lowpass'
        filter.frequency.value = 1200
        noiseSource.connect(filter)
        filter.connect(this.masterGain!)
        this.addBirds(ctx)
        break
      }
      case 'lofi': {
        filter.type = 'lowpass'
        filter.frequency.value = 2200
        noiseSource.connect(filter)
        filter.connect(this.masterGain!)
        this.addLofiPulse(ctx)
        break
      }
    }

    noiseSource.start()
  }

  private addDrips(ctx: AudioContext) {
    const scheduleDrip = () => {
      if (this.current !== 'rain') return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 1800 + Math.random() * 800
      gain.gain.value = 0
      osc.connect(gain)
      gain.connect(this.masterGain!)
      const now = ctx.currentTime
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.04, now + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)
      osc.start(now)
      osc.stop(now + 0.25)
      setTimeout(scheduleDrip, 150 + Math.random() * 500)
    }
    scheduleDrip()
  }

  private addMurmur(ctx: AudioContext) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = 220
    gain.gain.value = 0.015
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.15
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 60
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)
    osc.connect(gain)
    gain.connect(this.masterGain!)
    osc.start()
    lfo.start()
    this.nodes.push(osc, lfo, gain, lfoGain)
  }

  private addBirds(ctx: AudioContext) {
    const scheduleChirp = () => {
      if (this.current !== 'forest') return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      const base = 2200 + Math.random() * 1200
      osc.frequency.setValueAtTime(base, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(base * 1.4, ctx.currentTime + 0.08)
      gain.gain.value = 0
      osc.connect(gain)
      gain.connect(this.masterGain!)
      const now = ctx.currentTime
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.05, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)
      osc.start(now)
      osc.stop(now + 0.3)
      setTimeout(scheduleChirp, 1500 + Math.random() * 4000)
    }
    scheduleChirp()
  }

  private addLofiPulse(ctx: AudioContext) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 55
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.6
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.03
    gain.gain.value = 0.06
    lfo.connect(lfoGain)
    lfoGain.connect(gain.gain)
    osc.connect(gain)
    gain.connect(this.masterGain!)
    osc.start()
    lfo.start()
    this.nodes.push(osc, lfo, gain, lfoGain)
  }

  stop() {
    this.current = 'none'
    this.stopAll()
  }
}

export const soundscapeEngine = new SoundscapeEngine()

export const SOUNDSCAPES: { id: SoundscapeId; label: string; icon: string }[] = [
  { id: 'none', label: 'Kein Sound', icon: '🔇' },
  { id: 'rain', label: 'Regen', icon: '🌧️' },
  { id: 'cafe', label: 'Café', icon: '☕' },
  { id: 'whitenoise', label: 'White Noise', icon: '📻' },
  { id: 'forest', label: 'Wald', icon: '🌲' },
  { id: 'lofi', label: 'Lo-Fi', icon: '🎧' }
]
