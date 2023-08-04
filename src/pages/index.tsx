import Head from 'next/head'
import Planner from '../components/Planner/Planner'

export default function Home() {
  return (
    <>
      <Head>
        <title>Raid CD Planner</title>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#02010f" />
        <meta name="author" content="Steve Zelek" />
        <meta name="description" content="Raid CD Planner helps you plan your raid cooldowns in World of Warcraft!" />
        <meta name="keywords" content="world of warcraft, raiding, mythic, rashok, cooldown, planning, raid, teamwork, editor, timeline, help" />

        {/* <!-- Facebook Meta Tags --> */}
        <meta property="og:url" content="https://www.stevezelek.com/apps/raid-cd-planner/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Raid CD Planner" />
        <meta property="og:description" content="Raid CD Planner helps you plan your raid cooldowns in World of Warcraft!" />
        <meta property="og:image" content="https://stevezelek.com/assets/images/raid-cd-planner-card.png" />

        {/* <!-- Twitter Meta Tags --> */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="stevezelek.com" />
        <meta property="twitter:url" content="https://www.stevezelek.com/apps/raid-cd-planner/" />
        <meta name="twitter:title" content="Raid CD Planner" />
        <meta name="twitter:description" content="Raid CD Planner helps you plan your raid cooldowns in World of Warcraft!" />
        <meta name="twitter:image" content="https://stevezelek.com/assets/images/raid-cd-planner-card.png" />

      </Head>
      <span style={{ display: "none", }}>
        {process.env['COMMIT_HASH']}
      </span>
      <Planner />
    </>
  )
}
