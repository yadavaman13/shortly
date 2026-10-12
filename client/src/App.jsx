import { UrlProvider } from './app/features/url/context/urlContext.jsx';
import { UrlForm, UrlResult, UrlStats, UrlList } from './app/features/url/components/index.js';
import { Navbar, Toast, Footer } from './app/components/index.js';
import './App.scss';

function AppContent() {
    return (
        <div className="app-container">
            <div className="app-bg-grid" aria-hidden="true" />
            <Navbar />

            <main className="main-content">
                <section className="hero-section">
                    <h1 className="hero-title">
                        A cleaner web with <span className="highlight">shorter links</span>.
                    </h1>
                    <p className="hero-description">
                        Instant 6-character links with collision-safe generation and real-time
                        atomic visit analytics.
                    </p>
                </section>

                <UrlStats />

                <UrlForm />

                <UrlResult />

                <UrlList />
            </main>

            <Footer />

            <Toast />
        </div>
    );
}

export function App() {
    return (
        <UrlProvider>
            <AppContent />
        </UrlProvider>
    );
}

export default App;
