import { AlignEndVertical } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="flex-center wrapper flex-between flex flex-col gap-1 p-70 text-center sm:flex-row">
        <Link href='/'>
          <Image 
            src="/logo.svg"
            alt="logo"
            width={128}
            height={38}
          />
        </Link>

        <p>2024 SPAẞ. All Rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer