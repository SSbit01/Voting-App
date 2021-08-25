import "../style.css";
import Head from "next/head";
import {motion, AnimatePresence} from "framer-motion";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";


export default function MyApp({Component, pageProps, router}) {
  const pageVariants = {
    in: {
      opacity: 0,
      translateY: "-5vh"
    },
    out: {
      opacity: 1,
      translateY: 0
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-200 items-center">
      <Head>
        <title>Voting App</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
        <meta name="description" content="Voting app using next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar/>
      <AnimatePresence exitBeforeEnter>
        <motion.div key={router.route} initial="in" animate="out" exit="in" variants={pageVariants} className="m-4">
          <Component {...pageProps}/>
        </motion.div>
      </AnimatePresence>
      <Footer/>
    </div>
  );
}
