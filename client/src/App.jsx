import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './app/features/auth/context/authContext.jsx';
import { UrlProvider } from './app/features/url/context/urlContext.jsx';
import { QrProvider } from './app/features/qr/context/qrContext.jsx';
import { Navbar, Toast, Footer } from './app/components/index.js';
import AppRoutes from './app.routes.jsx';
import './App.scss';

function AppLayout() {
    return (
        <div className="app-container">
            <div className="app-bg-grid" aria-hidden="true" />
            <Navbar />
            <AppRoutes />
            <Footer />
            <Toast />
        </div>
    );
}

export function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <UrlProvider>
                    <QrProvider>
                        <AppLayout />
                    </QrProvider>
                </UrlProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;

