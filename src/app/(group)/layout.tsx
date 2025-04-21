import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const GroupLayout=({
  children,
}: {
  children: React.ReactNode
}) =>{
  return(
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className='flex-1 w-full px-4 py-8 justify-center items-center'>
      {children}
      </div>
      <Footer />
    </div>
  )
}

export default GroupLayout;
// TODO : Globally give the Footer & navbar and the type of session

