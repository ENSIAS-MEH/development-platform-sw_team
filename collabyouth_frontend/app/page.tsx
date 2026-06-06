import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* HERO + NAVBAR ensemble sur fond vert */}
      <div className="bg-gradient-to-br from-[#e8f5f0] to-[#f5fdf9]">

        {/* NAVBAR transparente sur le vert */}
        <nav className="flex items-center justify-between px-8 py-1">
          <Image
            src="/Img/collabyouth_logo_v1_fixed.png"
            alt="CollabYouth"
            width={350}
            height={380}
            className="object-contain"
          />
          <div className="flex gap-3">
            <Link
              href="/auth/login"
              className="px-5 py-2 rounded-xl border border-[#1D9E75] text-[#1D9E75] text-sm font-semibold hover:bg-white/50 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="px-5 py-2 rounded-xl bg-[#1D9E75] text-white text-sm font-semibold hover:bg-[#0F6E56] transition-colors"
            >
              Register
            </Link>
          </div>
        </nav>

        {/* HERO — texte gauche, image droite */}
        <section className="flex items-center justify-between px-16 py-16">
          
          {/* Texte à gauche */}
          <div className="flex-1 max-w-lg">
            <h1 className="text-4xl font-bold text-[#0F6E56] mb-6 leading-tight">
              Connect.<br />Collaborate.<br />Create.
            </h1>
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              CollabYouth connects students who want to build together hackathons,
              challenges, real projects. Create your profile, showcase your skills,
              find your teammates and get things done.
            </p>
            <div className="flex gap-4">
              <Link
                href="/auth/register"
                className="px-6 py-3 rounded-xl bg-[#1D9E75] text-white font-semibold hover:bg-[#0F6E56] transition-colors shadow-sm"
              >
                Join now
              </Link>
              <Link
                href="#how-it-works"
                className="px-6 py-3 rounded-xl border border-[#1D9E75] text-[#1D9E75] font-semibold hover:bg-white/50 transition-colors"
              >
                Learn more
              </Link>
            </div>
          </div>

          {/* Image à droite */}
          <div className="flex- flex justify-center">
            <Image
              src="/Img/image-removebg-preview.png"
              alt="CollabYouth Network"
              width={380}
              height={380}
              className="object-contain"
            />
          </div>
        </section>
      </div>

      {/* WHY COLLABYOUTH */}
      <section className="px-16 py-16 bg-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Why CollabYouth?
        </h2>
        <p className="text-gray-500 text-sm mb-12 max-w-2xl">
          Every student has something to bring to the table a skill, an idea,
          an energy. CollabYouth exists so these talents can meet, complement
          each other, and create something greater together. Because the best
          projects are never built alone.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Participation */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
            <Image
              src="/Img/event_participation_logo.png"
              alt="Participation"
              width={380}
              height={380}
              className="object-contain mb-4"
            />
            <h3 className="font-bold text-[#1D9E75] text-lg mb-1">Participation</h3>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
              Join · Engage · Experience
            </p>
            <p className="text-gray-500 text-sm">
              Join events, take part in projects
			  and grow your student network.
            </p>
          </div>

          {/* Hackathon */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
            <Image
              src="/Img/hackathon_logo.png"
              alt="Hackathon"
              width={380}
              height={380}
              className="object-contain mb-4"
            />
            <h3 className="font-bold text-[#1D9E75] text-lg mb-1">Hackathon</h3>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
              Build · Innovate · Win
            </p>
            <p className="text-gray-500 text-sm">
              Dive into intensive hackathons and
			  turn your ideas into real projects.
            </p>
          </div>

          {/* Challenge */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
            <Image
              src="/Img/challenge_logo.png"
              alt="Challenge"
              width={380}
              height={380}
              className="object-contain mb-4"
            />
            <h3 className="font-bold text-yellow-500 text-lg mb-1">Challenge</h3>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
              Compete · Grow · Succeed
            </p>
            <p className="text-gray-500 text-sm">
              Take on technical challenges 
			  and show what you're capable of.
            </p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-16 py-16 bg-[#f9fefb]">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          How it works
        </h2>
        <p className="text-gray-500 text-sm mb-12 max-w-2xl">
          In 3 simple steps, you go from idea to a completed project.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Étape 1 */}
          <div className="flex flex-col p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#e8f5f0] text-[#1D9E75] font-bold flex items-center justify-center mb-4 text-lg">
              1
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              Create your profile
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Sign up in a few seconds, add your skills, your education,
			   and what you want to build.
            </p>
          </div>

          {/* Étape 2 */}
          <div className="flex flex-col p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#e8f5f0] text-[#1D9E75] font-bold flex items-center justify-center mb-4 text-lg">
              2
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              Find your team
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Explore existing projects or propose your own.
			  Find teammates with complementary skills.
            </p>
          </div>

          {/* Étape 3 */}
          <div className="flex flex-col p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#e8f5f0] text-[#1D9E75] font-bold flex items-center justify-center mb-4 text-lg">
              3
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              Launch your project
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Collaborate, innovate, and showcase your project during hackathons 
			  or real-world challenges.
            </p>
          </div>

        </div>
      </section>

      {/* ABOUT US */}
      <section className="px-16 py-16 bg-white">
        <div className="flex items-center gap-16">
          
          {/* Texte */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              About Us
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
			CollabYouth is a platform dedicated to students and hackathon organizers, 
			born from the belief that the best projects are never built alone. 
			It allows students to take part in challenges, form teams, and develop 
			collaborative projects, while enabling organizers to create, publish, 
			and manage their events while facilitating connections with participating teams. Designed by students for students, CollabYouth is a space where talent meets, ideas come to life, and innovation becomes collective.

            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
             Whether you're a developer, designer, project manager, 
			 or simply someone with a big idea you have a place here. 
			 CollabYouth provides you with the tools to create, collaborate, and grow.
            </p>
            <Link
              href="/register"
              className="inline-block px-6 py-3 rounded-xl bg-[#1D9E75] text-white font-semibold hover:bg-[#0F6E56] transition-colors"
            >
              Join the community
            </Link>
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#e8f5f0] text-center">
              <p className="text-3xl font-bold text-[#0F6E56] mb-1">50+</p>
              <p className="text-sm text-gray-500">Étudiants inscrits</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#e8f5f0] text-center">
              <p className="text-3xl font-bold text-[#0F6E56] mb-1">12+</p>
              <p className="text-sm text-gray-500">Projets lancés</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#e8f5f0] text-center">
              <p className="text-3xl font-bold text-[#0F6E56] mb-1">10+</p>
              <p className="text-sm text-gray-500">Hackathons organisés</p>
            </div>
            
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto py-5 px-8 border-t border-gray-100 bg-white">
        <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400">
          <Link href="/privacy" className="hover:text-[#1D9E75] transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[#1D9E75] transition-colors">
            Conditions d'utilisation
          </Link>
          <Link href="/contact" className="hover:text-[#1D9E75] transition-colors">
            Terms of Use
          </Link>
          <span>© 2026 CollabYouth</span>
        </div>
      </footer>

    </div>
  );
}