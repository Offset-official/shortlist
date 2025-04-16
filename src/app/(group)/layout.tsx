import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const GroupLayout=({
  children,
}: {
  children: React.ReactNode
}) =>{
  return(
    <div className="min-h-screen flex flex-col bg-background ">
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}

export default GroupLayout;
// TODO : Globally give the Footer & navbar and the type of session

