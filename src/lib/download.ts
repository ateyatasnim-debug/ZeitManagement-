/**
 * Offers a generated file to the user. Uses the Claude Artifact `downloads`
 * capability when the page is running inside an artifact viewer (plain
 * download links are blocked there); falls back to a normal browser
 * download for the self-hosted / deployed build.
 */
export async function offerDownload(filename: string, data: string, mimeType = 'application/json') {
  const claude = (window as any).claude
  if (claude?.use) {
    try {
      const downloads = await claude.use('downloads')
      if (downloads) {
        await downloads.save({ filename, data })
        return
      }
    } catch {
      // declined, rate-limited, or unavailable — fall back below
    }
  }

  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
