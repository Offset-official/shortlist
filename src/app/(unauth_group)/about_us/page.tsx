import Image from 'next/image';

export default function AboutUs() {
  return (
    <div className="flex flex-col min-h-screen">
        <div className="flex flex-col items-center relative p-20">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">Meet Team Offset</h1>
          <Image
            src="/assets/us.jpg"
            alt="Team Offset"
            width={10000}
            height={10000}
            className="fill rounded-2xl mb-8 border border-border bg-card contain w-[50vw]"
          />
          <div className='max-w-[50vw]'>
            <p className="text-lg text-muted-foreground text-center mb-8">
            We are a group of friends passionate about developing solutions to real-world problems we encounter in our surroundings and daily lives. Our diverse backgrounds and shared vision inspire us to create meaningful and impactful solutions.
            </p>
          <div className="w-full bg-card rounded-xl shadow p-6 mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">Where Did We Get This Idea?</h2>
            <p className="text-base text-muted-foreground text-center">
              The idea for ShortList was born out of our own experiences with job hunting and recruitment. We noticed inefficiencies and a lack of personalization in the process, which inspired us to create a platform that bridges the gap between candidates and recruiters.
            </p>
          </div>
            </div>
        </div>
    </div>
  );
}