import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlankerThumbnail, StroopThumbnail, VisualSearchThumbnail, NBackThumbnail } from '@/components/Thumbnails';
import UniversityLogo from '@/components/UniversityLogo';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 max-w-6xl mx-auto">
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
        </div>
      </div>
    </div>
  );
}
