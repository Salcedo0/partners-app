import type { MemeBox } from './db'

/** Pick a font size (in container-width units) that fits `text` inside the box. */
function fitSize(text: string, boxWcq: number, boxHcq: number) {
  const len = Math.max(text.length, 1)
  let fs = Math.min(boxHcq * 0.8, 9)
  while (fs > 1.6) {
    const perLine = Math.max(1, Math.floor(boxWcq / (fs * 0.56)))
    const words = text.split(/\s+/)
    // Rough word-wrap count so long words don't overflow.
    let lines = 1
    let cur = 0
    for (const w of words) {
      const wl = Math.max(w.length, 1)
      if (cur && cur + 1 + wl > perLine) {
        lines++
        cur = wl
      } else cur += (cur ? 1 : 0) + wl
      if (wl > perLine) lines += Math.floor(wl / perLine)
    }
    if (lines * fs * 1.08 <= boxHcq && (len <= perLine * lines)) break
    fs -= 0.3
  }
  return fs
}

export function MemeView({
  image,
  ratio,
  boxes,
  texts,
}: {
  image: string
  ratio: number
  boxes: MemeBox[]
  texts: string[]
}) {
  return (
    <div className="meme" style={{ containerType: 'inline-size' }}>
      <img src={image} alt="" draggable={false} />
      {boxes.map((b, i) => {
        const text = texts[i] || ''
        const fs = fitSize(text, b.w, b.h / ratio)
        return (
          <div
            key={i}
            className="meme-box"
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%`, fontSize: `${fs}cqw` }}
          >
            {text}
          </div>
        )
      })}
    </div>
  )
}
