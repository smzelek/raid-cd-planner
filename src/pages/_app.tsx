import '@/styles/globals.scss'
import type { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import style from '@/styles/Global.module.scss'

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.className} ${style['wrapper']}`}>
      <Component {...pageProps} />
    </div>
  )
}
