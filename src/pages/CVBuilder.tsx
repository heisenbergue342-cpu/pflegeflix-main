import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Download, Plus, Trash2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';

interface CVData {
  id?: string;
  template_name: string;
  personal_info: {
    name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
  };
  work_experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
  certifications: string[];
  languages: Array<{
    language: string;
    level: string;
  }>;
}

export default function CVBuilder() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cvData, setCvData] = useState<CVData>({
    template_name: 'modern',
    personal_info: {
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      city: profile?.city || '',
      state: profile?.state || '',
    },
    work_experience: [],
    education: [],
    skills: profile?.skills || [],
    certifications: [],
    languages: [],
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadCVData();
  }, [user]);

  const loadCVData = async () => {
    try {
      const { data, error } = await supabase
        .from('cv_builder_data')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setCvData({
          id: data.id,
          template_name: data.template_name,
          personal_info: data.personal_info as CVData['personal_info'],
          work_experience: data.work_experience as CVData['work_experience'],
          education: data.education as CVData['education'],
          skills: data.skills as string[],
          certifications: data.certifications as string[],
          languages: data.languages as CVData['languages'],
        });
      }
    } catch (error) {
      console.error('Error loading CV data:', error);
    }
  };

  const saveCVData = async () => {
    setLoading(true);
    try {
      const dataToSave = {
        user_id: user?.id,
        template_name: cvData.template_name,
        personal_info: cvData.personal_info,
        work_experience: cvData.work_experience,
        education: cvData.education,
        skills: cvData.skills,
        certifications: cvData.certifications,
        languages: cvData.languages,
      };

      if (cvData.id) {
        const { error } = await supabase
          .from('cv_builder_data')
          .update(dataToSave)
          .eq('id', cvData.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('cv_builder_data')
          .insert([dataToSave])
          .select()
          .single();
        if (error) throw error;
        setCvData({ ...cvData, id: data.id });
      }

      toast.success('CV gespeichert!');
    } catch (error) {
      console.error('Error saving CV:', error);
      toast.error('Fehler beim Speichern des Lebenslaufs');
    } finally {
      setLoading(false);
    }
  };

  const addWorkExperience = () => {
    setCvData({
      ...cvData,
      work_experience: [
        ...cvData.work_experience,
        { title: '', company: '', location: '', startDate: '', endDate: '', description: '' }
      ]
    });
  };

  const removeWorkExperience = (index: number) => {
    setCvData({
      ...cvData,
      work_experience: cvData.work_experience.filter((_, i) => i !== index)
    });
  };

  const updateWorkExperience = (index: number, field: string, value: string) => {
    const updated = [...cvData.work_experience];
    updated[index] = { ...updated[index], [field]: value };
    setCvData({ ...cvData, work_experience: updated });
  };

  const addEducation = () => {
    setCvData({
      ...cvData,
      education: [...cvData.education, { degree: '', institution: '', year: '' }]
    });
  };

  const removeEducation = (index: number) => {
    setCvData({
      ...cvData,
      education: cvData.education.filter((_, i) => i !== index)
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...cvData.education];
    updated[index] = { ...updated[index], [field]: value };
    setCvData({ ...cvData, education: updated });
  };

  const downloadPDF = async () => {
    toast.info('PDF-Export wird in Kürze verfügbar sein');
  };

  return (
    <>
      <SEO 
        title="Lebenslauf-Builder"
        description="Erstellen Sie Ihren professionellen Lebenslauf für Gesundheitswesen-Jobs"
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Lebenslauf-Builder</h1>
          <div className="flex gap-2">
            <Button onClick={saveCVData} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Speichern
            </Button>
            <Button onClick={downloadPDF} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Als PDF
            </Button>
          </div>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Persönliche Informationen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={cvData.personal_info.name}
                onChange={(e) => setCvData({
                  ...cvData,
                  personal_info: { ...cvData.personal_info, name: e.target.value }
                })}
              />
            </div>
            <div>
              <Label>E-Mail</Label>
              <Input
                type="email"
                value={cvData.personal_info.email}
                onChange={(e) => setCvData({
                  ...cvData,
                  personal_info: { ...cvData.personal_info, email: e.target.value }
                })}
              />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input
                value={cvData.personal_info.phone}
                onChange={(e) => setCvData({
                  ...cvData,
                  personal_info: { ...cvData.personal_info, phone: e.target.value }
                })}
              />
            </div>
            <div>
              <Label>Stadt</Label>
              <Input
                value={cvData.personal_info.city}
                onChange={(e) => setCvData({
                  ...cvData,
                  personal_info: { ...cvData.personal_info, city: e.target.value }
                })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Berufserfahrung</h2>
            <Button onClick={addWorkExperience} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Hinzufügen
            </Button>
          </div>
          {cvData.work_experience.map((exp, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">Position {index + 1}</h3>
                <Button
                  onClick={() => removeWorkExperience(index)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Jobtitel"
                  value={exp.title}
                  onChange={(e) => updateWorkExperience(index, 'title', e.target.value)}
                />
                <Input
                  placeholder="Unternehmen"
                  value={exp.company}
                  onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                />
                <Input
                  placeholder="Startdatum"
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                />
                <Input
                  placeholder="Enddatum"
                  type="month"
                  value={exp.endDate}
                  onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                />
              </div>
              <Textarea
                className="mt-3"
                placeholder="Beschreibung"
                value={exp.description}
                onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
              />
            </div>
          ))}
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Ausbildung</h2>
            <Button onClick={addEducation} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Hinzufügen
            </Button>
          </div>
          {cvData.education.map((edu, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">Ausbildung {index + 1}</h3>
                <Button
                  onClick={() => removeEducation(index)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Abschluss"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                />
                <Input
                  placeholder="Institution"
                  value={edu.institution}
                  onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                />
                <Input
                  placeholder="Jahr"
                  value={edu.year}
                  onChange={(e) => updateEducation(index, 'year', e.target.value)}
                />
              </div>
            </div>
          ))}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Fähigkeiten</h2>
          <Textarea
            placeholder="Geben Sie Ihre Fähigkeiten ein (getrennt durch Kommas)"
            value={cvData.skills.join(', ')}
            onChange={(e) => setCvData({
              ...cvData,
              skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            })}
          />
        </Card>
      </div>
    </>
  );
}
