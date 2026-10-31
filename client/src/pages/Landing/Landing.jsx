import Audience from './sections/Audience.jsx';
import Cta from './sections/Cta.jsx';
import Features from './sections/Features.jsx';
import Footer from './sections/Footer.jsx';
import Header from './sections/Header.jsx';
import Hero from './sections/Hero.jsx';
import Problem from './sections/Problem.jsx';
import Security from './sections/Security.jsx';
import Steps from './sections/Steps.jsx';
import './Landing.css';

export default function Landing() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Problem />
        <Audience />
        <Features />
        <Steps />
        <Security />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
