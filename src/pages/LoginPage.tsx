export function LoginPage() {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID
  const redirectUri = encodeURIComponent(import.meta.env.VITE_REDIRECT_URI)
  const scope = encodeURIComponent('identify guilds.members.read')
  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0e14' }}>
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl" style={{ background: '#FFB5B5' }}>
          🐱
        </div>
        <h1 className="text-3xl font-black text-white mb-2">貓哥管理介面</h1>
        <p className="mb-8" style={{ color: '#8b92a8' }}>需要 Discord 管理員身分才能登入</p>
        
          <a href={discordAuthUrl} className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-black text-white transition-all hover:opacity-90" style={{ background: '#5865F2' }}>使用 Discord 登入</a>
      </div>
    </div>
  )
}
