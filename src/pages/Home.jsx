import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlankerThumbnail, StroopThumbnail } from '@/components/Thumbnails';
import UniversityLogo from '@/components/UniversityLogo';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 pt-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl">
              <UniversityLogo className="w-full h-full" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Cognitive Psychology Demonstrations
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Interactive experiments
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white border-slate-200 hover:border-blue-300 transition-colors overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video">
                <FlankerThumbnail className="w-full h-full" />
              </div>
              <div className="p-6">
                <CardTitle className="text-xl mb-3">Flanker Task</CardTitle>
                <Link to="/flanker">
                  <Button className="w-full">
                    Start Flanker Task
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 hover:border-purple-300 transition-colors overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video">
                <StroopThumbnail className="w-full h-full" />
              </div>
              <div className="p-6">
                <CardTitle className="text-xl mb-3">Stroop Task</CardTitle>
                <Link to="/stroop">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Start Stroop Task
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
