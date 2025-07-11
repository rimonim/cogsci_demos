import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlankerThumbnail, StroopThumbnail, VisualSearchThumbnail, NBackThumbnail, PosnerThumbnail, MentalRotationThumbnail } from '@/components/Thumbnails';
import UniversityLogo from '@/components/UniversityLogo';
import { InstructorAuth } from '@/utils/instructorAuth';
import { LogOut, Settings, Users } from 'lucide-react';

export default function Home() {
  const isInstructorLoggedIn = InstructorAuth.isAuthenticated();

  const handleLogout = () => {
    InstructorAuth.logout();
    window.location.reload(); // Refresh to update UI
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Instructor Controls Bar */}
        {isInstructorLoggedIn && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm mb-6 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Instructor Mode</span>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/sessions">
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Sessions
                  </Button>
                </Link>
                <Link to="/results">
                  <Button variant="outline" size="sm">
                    View Results
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-8 lg:mb-12 pt-6 lg:pt-8">
          <div className="flex justify-center mb-4 lg:mb-6">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl">
              <UniversityLogo className="w-full h-full" />
            </div>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3 lg:mb-4">
            Cognitive Psychology Demonstrations
          </h1>
          <p className="text-base lg:text-lg text-slate-600 max-w-2xl mx-auto">
            In-class Interactive Experiments
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 mb-8 max-w-6xl mx-auto">
          <Card className="bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video sm:aspect-[4/3] lg:aspect-square xl:aspect-video">
                <FlankerThumbnail className="w-full h-full" />
              </div>
              <div className="p-4 lg:p-6">
                <CardTitle className="text-lg lg:text-xl mb-3">Flanker</CardTitle>
                <Link to="/flanker">
                  <Button className="w-full">
                    Start Flanker
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video sm:aspect-[4/3] lg:aspect-square xl:aspect-video">
                <StroopThumbnail className="w-full h-full" />
              </div>
              <div className="p-4 lg:p-6">
                <CardTitle className="text-lg lg:text-xl mb-3">Stroop</CardTitle>
                <Link to="/stroop">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Start Stroop
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video sm:aspect-[4/3] lg:aspect-square xl:aspect-video">
                <VisualSearchThumbnail className="w-full h-full" />
              </div>
              <div className="p-4 lg:p-6">
                <CardTitle className="text-lg lg:text-xl mb-3">Visual Search</CardTitle>
                <Link to="/visual-search">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Start Visual Search
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video sm:aspect-[4/3] lg:aspect-square xl:aspect-video">
                <NBackThumbnail className="w-full h-full" />
              </div>
              <div className="p-4 lg:p-6">
                <CardTitle className="text-lg lg:text-xl mb-3">N-Back</CardTitle>
                <Link to="/nback">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Start N-Back
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video sm:aspect-[4/3] lg:aspect-square xl:aspect-video">
                <PosnerThumbnail className="w-full h-full" />
              </div>
              <div className="p-4 lg:p-6">
                <CardTitle className="text-lg lg:text-xl mb-3">Posner Cueing</CardTitle>
                <Link to="/posner">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Start Posner
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video sm:aspect-[4/3] lg:aspect-square xl:aspect-video">
                <MentalRotationThumbnail className="w-full h-full" />
              </div>
              <div className="p-4 lg:p-6">
                <CardTitle className="text-lg lg:text-xl mb-3">Mental Rotation</CardTitle>
                <Link to="/mental-rotation">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Start Mental Rotation
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructor Login Section */}
        {!isInstructorLoggedIn && (
          <div className="text-center mt-8 pt-8 border-t border-slate-200">
            <p className="text-slate-600 text-sm mb-4">
              Instructor access for session management and results
            </p>
            <Link to="/login">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Instructor Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
