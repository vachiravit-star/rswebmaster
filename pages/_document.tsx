import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document'
import fs from 'fs'
import path from 'path'

interface MyDocumentProps extends DocumentInitialProps {
  themeCss: string
}

export default class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext): Promise<MyDocumentProps> {
    const initialProps = await Document.getInitialProps(ctx)

    let themeCss = ''
    try {
      const file = path.join(process.cwd(), 'data', 'theme.json')
      if (fs.existsSync(file)) {
        const theme = JSON.parse(fs.readFileSync(file, 'utf-8')) as { palette: Record<string, string>; mode?: string }
        if (theme.palette) {
          const paletteVars = Object.entries(theme.palette)
            .map(([k, v]) => `--color-primary-${k}: ${v}`)
            .join('; ')

          const LIGHT_GALLERY = [
            '--gallery-bg: var(--color-primary-50)',
            '--gallery-placeholder-bg: linear-gradient(135deg, var(--color-primary-100) 0%, var(--color-primary-200) 60%, var(--color-primary-300) 100%)',
            '--gallery-text: var(--color-primary-900)',
            '--gallery-text-muted: var(--color-primary-600)',
            '--gallery-btn-bg: var(--color-primary-100)',
            '--gallery-btn-text: var(--color-primary-800)',
            '--gallery-btn-hover: var(--color-primary-200)',
          ]
          const DARK_GALLERY = [
            '--gallery-bg: color-mix(in srgb, var(--color-primary-900) 80%, black)',
            '--gallery-placeholder-bg: linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 60%, var(--color-primary-700) 100%)',
            '--gallery-text: #ffffff',
            '--gallery-text-muted: rgba(255,255,255,0.55)',
            '--gallery-btn-bg: rgba(255,255,255,0.1)',
            '--gallery-btn-text: #ffffff',
            '--gallery-btn-hover: rgba(255,255,255,0.2)',
          ]

          const MODE_VARS: Record<string, string[]> = {
            'light': [
              '--gradient-header-start: var(--color-primary-100)',
              '--gradient-header-mid: var(--color-primary-200)',
              '--gradient-header-end: var(--color-primary-300)',
              '--on-gradient-text: var(--color-primary-900)',
              '--on-gradient-muted: var(--color-primary-700)',
              '--on-gradient-link: var(--color-primary-600)',
              '--stats-value-color: var(--color-primary-800)',
              '--stats-label-color: var(--color-primary-600)',
              ...LIGHT_GALLERY,
            ],
            'dark': [
              '--gradient-header-start: var(--color-primary-900)',
              '--gradient-header-mid: var(--color-primary-700)',
              '--gradient-header-end: var(--color-primary-600)',
              '--on-gradient-text: #ffffff',
              '--on-gradient-muted: rgba(255,255,255,0.7)',
              '--on-gradient-link: var(--color-primary-300)',
              '--stats-value-color: #fbbf24',
              '--stats-label-color: #fed7aa',
              ...DARK_GALLERY,
            ],
            'solid-light': [
              '--gradient-header-start: var(--color-primary-100)',
              '--gradient-header-mid: var(--color-primary-100)',
              '--gradient-header-end: var(--color-primary-100)',
              '--on-gradient-text: var(--color-primary-900)',
              '--on-gradient-muted: var(--color-primary-700)',
              '--on-gradient-link: var(--color-primary-600)',
              '--stats-value-color: var(--color-primary-800)',
              '--stats-label-color: var(--color-primary-600)',
              ...LIGHT_GALLERY,
            ],
            'solid-dark': [
              '--gradient-header-start: var(--color-primary-700)',
              '--gradient-header-mid: var(--color-primary-700)',
              '--gradient-header-end: var(--color-primary-700)',
              '--on-gradient-text: #ffffff',
              '--on-gradient-muted: rgba(255,255,255,0.7)',
              '--on-gradient-link: var(--color-primary-300)',
              '--stats-value-color: #fbbf24',
              '--stats-label-color: #fed7aa',
              ...DARK_GALLERY,
            ],
          }
          const modeVars = (MODE_VARS[theme.mode ?? 'dark'] ?? MODE_VARS['dark']).join('; ')

          themeCss = `:root { ${paletteVars}; ${modeVars} }`
        }
      }
    } catch { /* use globals.css defaults */ }

    return { ...initialProps, themeCss }
  }

  render() {
    const { themeCss } = this.props as MyDocumentProps
    return (
      <Html lang="th">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap"
            rel="stylesheet"
          />
          <meta name="theme-color" content="#E65100" />
          {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
        </Head>
        <body className="antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
