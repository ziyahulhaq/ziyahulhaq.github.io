import Welcome from "#components/welcome"
import Navbar from "#components/navbar"
import Dock from "#components/dock"
import TerminalWindow from "./window/Terminal"
import SafariWindow from "./window/Safari"
import ResumeWindow from "./window/Resume"
import Finder from "./window/Finder"
import Text from "./window/Text"
import Image from "./window/Image"
import Contect from "./window/Contect"
import Home from "#components/Home"
import gsap from "gsap"
import { Draggable } from "gsap/Draggable"

gsap.registerPlugin(Draggable)

const App = () => {
  return (
    <main>
    <Navbar/>
      <Welcome/>
      <Dock/>
     <TerminalWindow/>
    <SafariWindow/>
    <ResumeWindow/>
    <Finder/>
    <Text/>
    <Image/>
    <Contect/>
    <Home/>


    </main>
  )
}

export default App








//          https://todo-appp-kappa.vercel.app/


















































