import Footer from "@/components/Footer";
import Navbar from "@/components/LandingNavbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
    }

export default Layout;