import { Link } from 'react-router-dom'
import { Briefcase, Users, Zap, Shield, ArrowRight, Sparkles, TrendingUp, Award, Brain, Star } from 'lucide-react'

const Home = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Find Your Next
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-pulse">
                  Web3 Opportunity
                </span>
              </h1>
            </div>
            
            <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Connect with the best Web3 jobs and talent. Post jobs, find opportunities, and build the future of decentralized work.
              </p>
            </div>
            
            <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4 justify-center" style={{animationDelay: '0.6s'}}>
              <Link to="/jobs" className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg">
                <span className="flex items-center justify-center gap-2">
                  Browse Jobs
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link to="/register" className="group border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Get Started
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 bg-clip-text text-transparent mb-4">
                Why Choose Web3 Jobs?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Experience the next generation of job searching with cutting-edge technology
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Briefcase className="h-8 w-8" />}
              title="Quality Jobs"
              description="Curated job listings from top Web3 companies and startups"
              color="purple"
              delay="0.1s"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Global Talent"
              description="Connect with developers, designers, and professionals worldwide"
              color="blue"
              delay="0.2s"
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Fast Payments"
              description="Secure blockchain payments for job postings and services"
              color="green"
              delay="0.3s"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Secure & Transparent"
              description="Blockchain-verified transactions and transparent processes"
              color="orange"
              delay="0.4s"
            />
          </div>
        </div>
      </section>

      {/* Smart Resume Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  AI POWERED
                </span>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent mb-6">
                Smart Resume Analysis
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Get AI-powered insights on your resume with comprehensive analysis, career guidance, and improvement suggestions - all powered by cutting-edge technology.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 transition-colors">AI-powered career insights and recommendations</span>
                </div>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 transition-colors">ATS optimization and keyword analysis</span>
                </div>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 transition-colors">Personalized improvement suggestions</span>
                </div>
              </div>
              <div className="mt-8">
                <Link to="/profile" className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg">
                  <span className="flex items-center justify-center gap-2">
                    Try Smart Resume
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>
            </div>
            
            <div className="animate-fade-in-right">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 transform hover:scale-105 transition-all duration-500">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Brain className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">Resume Analysis</h3>
                        <p className="text-gray-600">AI-Powered Insights</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Overall Score</span>
                        <span className="text-2xl font-bold text-purple-600">87/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full animate-progress" style={{width: '87%'}}></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-xl">
                        <div className="text-green-600 font-semibold flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Strengths
                        </div>
                        <div className="text-green-700 text-sm">Strong technical skills</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-xl">
                        <div className="text-blue-600 font-semibold flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          ATS Score
                        </div>
                        <div className="text-blue-700 text-sm">82% optimized</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-20 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Web3 Journey?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of professionals building the future of work
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="group bg-white text-purple-600 px-10 py-5 rounded-xl text-lg font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg">
                <span className="flex items-center justify-center gap-2">
                  Create Account
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link to="/jobs" className="group border-2 border-white text-white hover:bg-white hover:text-purple-600 px-10 py-5 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                <span className="flex items-center justify-center gap-2">
                  <Briefcase className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Browse Jobs
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const FeatureCard = ({ icon, title, description, color, delay }) => {
  const getColorClasses = (color) => {
    const colors = {
      purple: 'from-purple-500 to-purple-600 group-hover:from-purple-600 group-hover:to-purple-700',
      blue: 'from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700',
      green: 'from-green-500 to-green-600 group-hover:from-green-600 group-hover:to-green-700',
      orange: 'from-orange-500 to-orange-600 group-hover:from-orange-600 group-hover:to-orange-700'
    }
    return colors[color] || colors.purple
  }

  return (
    <div 
      className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in-up border border-gray-100"
      style={{animationDelay: delay}}
    >
      <div className={`text-white mb-6 p-4 rounded-xl bg-gradient-to-br ${getColorClasses(color)} transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 w-fit shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
        {description}
      </p>
      
      {/* Hover indicator */}
      <div className="mt-4 flex items-center text-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2">
        <span className="text-sm font-medium">Learn more</span>
        <ArrowRight className="h-4 w-4 ml-1" />
      </div>
    </div>
  )
}

export default Home