import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <>
      <Head>
        <title>Real VPN — Secure, Fast, Private</title>
        <meta name="description" content="Download Real VPN for Windows. One click to change your IP and browse securely." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <main className={styles.main}>
        {/* Animated background */}
        <div className={styles.bg}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.orb3} />
          <div className={styles.grid} />
        </div>

        <div className={styles.container}>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🛡</span>
              <span className={styles.logoText}>Real VPN</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.dot} />
              v1.0.0 Live
            </div>
          </header>

          {/* Hero */}
          <section className={styles.hero}>
            <div className={styles.tag}>🔒 Military-Grade Encryption</div>
            <h1 className={styles.title}>
              True Privacy in
              <br />
              <span className={styles.gradient}>One Click.</span>
            </h1>
            <p className={styles.subtitle}>
              Change your IP instantly. Bypass restrictions, secure your connection, and browse the web without limits. 
            </p>

            {/* Download Button Area */}
            <div className={styles.form}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                <a 
                  href="https://drive.google.com/uc?export=download&id=164rrJDD5nxAJh5OtOMbMurK9z00RmnT_" 
                  className={styles.btn}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: '1', minWidth: '250px' }}
                >
                  <span style={{fontSize: '24px'}}>💻</span> Windows <span>→</span>
                </a>
                <a 
                  href="/download/RealVPN-Mobile.apk" 
                  className={styles.btn}
                  download
                  style={{ background: 'linear-gradient(135deg, #00C851, #007E33)', flex: '1', minWidth: '250px' }}
                >
                  <span style={{fontSize: '24px'}}>📱</span> Android <span>→</span>
                </a>
              </div>
              <p style={{ marginTop: '16px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                Requires Windows 10/11 or Android 8.0+
              </p>
            </div>
            
            {/* Warning Note */}
            <div style={{
              background: 'rgba(255,255,255,0.05)', 
              padding: '16px', 
              borderRadius: '12px', 
              border: '1px solid rgba(255,255,255,0.1)',
              maxWidth: '500px',
              margin: '0 auto',
              textAlign: 'left'
            }}>
              <p style={{color: '#ffc107', fontWeight: 600, fontSize: '14px', marginBottom: '4px'}}>
                ⚠️ Important Installation Note:
              </p>
              <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.5}}>
                You must have <strong>OpenVPN Connect</strong> installed on your computer first. 
                If you don't have it, <a href="https://openvpn.net/client/" target="_blank" rel="noopener noreferrer" style={{color: '#00d4ff', textDecoration: 'underline'}}>download it here</a> before running our app.
              </p>
            </div>
          </section>

          {/* Features */}
          <section className={styles.features}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🚀</div>
              <h3>Instant Connection</h3>
              <p>Just click connect. We automatically pick the best server configuration for you.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔐</div>
              <h3>System-Wide Protection</h3>
              <p>Unlike browser proxies, Real VPN protects all your apps, games, and system traffic.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🌍</div>
              <h3>Global Servers</h3>
              <p>Access content from anywhere in the world by masking your true location.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h3>No Logs</h3>
              <p>Your privacy is absolute. We do not track, log, or store your internet activity.</p>
            </div>
          </section>

          {/* Footer */}
          <footer className={styles.footer}>
            <p>&copy; 2026 Real VPN. Secure and Private.</p>
          </footer>
        </div>
      </main>
    </>
  );
}
