import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  BrainCircuit, Users, Building2, Briefcase, Trophy, Sparkles,
  ArrowRight, CheckCircle2, Star, TrendingUp, Target, Zap,
  ChevronRight, GraduationCap, BarChart3, Bell, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  { icon: BrainCircuit, title: "AI Hiring Simulation", desc: "Predict which students will get selected before the drive even begins.", color: "bg-blue-500/10 text-blue-600" },
  { icon: Sparkles, title: "Hidden Talent Finder", desc: "Discover overlooked students with strong skills beyond just CGPA.", color: "bg-purple-500/10 text-purple-600" },
  { icon: Target, title: "Round-by-Round Tracking", desc: "Track every candidate through every interview round in real time.", color: "bg-orange-500/10 text-orange-600" },
  { icon: Bell, title: "Automated Notifications", desc: "Auto-send personalized emails to candidates after each round result.", color: "bg-green-500/10 text-green-600" },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Deep insights on placement trends, company stats, and student performance.", color: "bg-pink-500/10 text-pink-600" },
  { icon: Zap, title: "AI Mock Interviews", desc: "Students practice with AI interviewers to build real confidence.", color: "bg-yellow-500/10 text-yellow-600" },
];

const STATS = [
  { value: "98%", label: "Placement Success Rate" },
  { value: "500+", label: "Companies Onboarded" },
  { value: "50K+", label: "Students Placed" },
  { value: "15min", label: "Average Setup Time" },
];

const TESTIMONIALS = [
  { name: "Dr. Ramesh Kumar", role: "Placement Officer, IIT Bombay", text: "TalentHub reduced our placement coordination effort by 70%. The AI predictions were surprisingly accurate.", stars: 5 },
  { name: "Priya Sharma", role: "Student, NIT Trichy", text: "The AI mock interviews helped me crack my TCS interview. The personalized feedback was exactly what I needed.", stars: 5 },
  { name: "Vikram Anand", role: "HR Manager, Infosys", text: "We found our best hires through TalentHub's Hidden Talent Finder. Highly recommended for campus drives.", stars: 5 },
];

const HOW_IT_WORKS = [
  { step: "01", title: "College Registers", desc: "Placement officers set up the campus profile, add students, and configure drive preferences." },
  { step: "02", title: "Company Creates Drive", desc: "Recruiters post job openings, define eligibility criteria, and schedule interview rounds." },
  { step: "03", title: "AI Matches Talent", desc: "Our AI analyzes every student profile and predicts the best matches for each company." },
  { step: "04", title: "Track & Select", desc: "Follow every candidate through rounds in real time, auto-notify results, and finalize offers." },
];

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">TalentHub Campus</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/login")}>Sign In</Button>
            <Button size="sm" onClick={() => setLocation("/register")} className="gap-1.5">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              AI-Powered Campus Recruitment Platform
            </Badge>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
              Campus Placements,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                Reimagined
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              TalentHub connects colleges, students, and recruiters on one intelligent platform —
              with AI that predicts, tracks, and optimizes every campus placement drive.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setLocation("/register")} className="gap-2 text-base px-8">
                Start for Free <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setLocation("/login")} className="gap-2 text-base px-8">
                View Demo
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">No credit card required · Free for colleges</p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.label} className="bg-card border rounded-2xl p-5 shadow-sm">
                <div className="text-3xl font-bold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="py-12 px-6 border-y bg-muted/30">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-6 uppercase tracking-widest font-medium">Trusted by top institutions</p>
          <div className="flex flex-wrap justify-center gap-8 text-muted-foreground font-semibold text-sm">
            {["IIT Bombay", "NIT Trichy", "VIT Vellore", "BITS Pilani", "Anna University", "COEP Pune"].map(c => (
              <span key={c} className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/10 text-purple-600 border-purple-200">Features</Badge>
            <h2 className="text-4xl font-bold mb-4">Everything you need for campus placements</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From AI predictions to automated emails — TalentHub handles the entire placement lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-card border rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-500/10 text-orange-600 border-orange-200">How it Works</Badge>
            <h2 className="text-4xl font-bold mb-4">Up and running in minutes</h2>
            <p className="text-muted-foreground text-lg">4 simple steps to transform your campus placement process.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-card border rounded-2xl p-6 flex gap-4">
                <div className="text-4xl font-black text-primary/20 leading-none shrink-0">{step.step}</div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR EVERYONE */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-600 border-green-200">For Everyone</Badge>
            <h2 className="text-4xl font-bold mb-4">Built for the entire placement ecosystem</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap, title: "For Students", color: "text-blue-600 bg-blue-50",
                points: ["Browse and apply to jobs", "AI-powered mock interviews", "Personal career agent", "Track application status", "Challenge arena for rejected students"],
              },
              {
                icon: Building2, title: "For Placement Officers", color: "text-purple-600 bg-purple-50",
                points: ["Manage all drives in one place", "Auto-notify students", "Analytics and reports", "AI hiring simulation", "Hidden talent finder"],
              },
              {
                icon: Users, title: "For Recruiters", color: "text-orange-600 bg-orange-50",
                points: ["Post jobs with one click", "Round-by-round tracking", "AI-ranked candidates", "Bulk email notifications", "Final offer management"],
              },
            ].map((card, i) => (
              <motion.div key={card.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-card border rounded-2xl p-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl mb-4">{card.title}</h3>
                <ul className="space-y-2.5">
                  {card.points.map(p => (
                    <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-yellow-500/10 text-yellow-600 border-yellow-200">Testimonials</Badge>
            <h2 className="text-4xl font-bold mb-4">Loved by colleges and companies</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-card border rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {Array(t.stars).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
            <div className="bg-gradient-to-br from-primary to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-white/5 rounded-3xl" />
              <div className="relative">
                <h2 className="text-4xl font-bold mb-4">Ready to transform your campus placements?</h2>
                <p className="text-white/80 text-lg mb-8">Join hundreds of colleges already using TalentHub Campus.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" onClick={() => setLocation("/register")} className="gap-2 text-base px-8 font-semibold">
                    Get Started Free <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => setLocation("/login")}
                    className="gap-2 text-base px-8 border-white/30 text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-12 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold">TalentHub Campus</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
              <span onClick={() => setLocation("/login")} className="hover:text-foreground transition-colors cursor-pointer">Login</span>
              <span onClick={() => setLocation("/register")} className="hover:text-foreground transition-colors cursor-pointer">Register</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 TalentHub Campus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}