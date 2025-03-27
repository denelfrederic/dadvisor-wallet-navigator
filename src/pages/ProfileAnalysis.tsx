
import { useAuthStatus } from "@/hooks/use-auth-status";
import ProfileContent from "@/components/profile/ProfileContent";
import ProfileEmptyState from "@/components/profile/ProfileEmptyState";
import ProfileLoading from "@/components/profile/ProfileLoading";
import { useProfileData } from "@/hooks/use-profile-data";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/utils/auth";
import Navbar from "@/components/Navbar";
import BottomNavbar from "@/components/BottomNavbar";

const ProfileAnalysis = () => {
  const { user: authUser } = useAuthStatus();
  const [directSessionUser, setDirectSessionUser] = useState<User | null>(null);
  
  console.log("ProfileAnalysis - Rendu initial");
  console.log("ProfileAnalysis - Utilisateur depuis useAuthStatus:", authUser);
  
  // Double-check authentication directly with Supabase
  useEffect(() => {
    const checkSession = async () => {
      console.log("ProfileAnalysis - Vérification de la session Supabase");
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        console.log("ProfileAnalysis - Session Supabase trouvée:", data.session.user.id);
        const sessionUser = data.session.user;
        setDirectSessionUser({
          id: sessionUser.id,
          email: sessionUser.email || "",
          name: sessionUser.email?.split('@')[0] || "",
          authProvider: "email" 
        });
      } else {
        console.log("ProfileAnalysis - Aucune session Supabase active");
        setDirectSessionUser(null);
      }
    };
    
    checkSession();
  }, []);
  
  // Use either the auth context user or the direct session user
  const user = authUser || directSessionUser;
  console.log("ProfileAnalysis - Utilisateur final:", user);
  
  const { 
    loading, 
    profileData, 
    hasTempData, 
    saveProfile, 
    handleRetakeQuestionnaire 
  } = useProfileData(user);

  console.log("ProfileAnalysis - État de chargement:", loading);
  console.log("ProfileAnalysis - Données de profil:", profileData);
  console.log("ProfileAnalysis - Données temporaires présentes:", hasTempData);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 bg-gradient-radial py-20 px-4 lg:px-8 pt-28 lg:pt-32">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-screen-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Votre profil d'investisseur</h1>
            <p className="text-muted-foreground mb-8 max-w-3xl">
              Découvrez votre profil d'investisseur personnalisé et les recommandations 
              adaptées à votre tolérance au risque et à vos objectifs financiers.
            </p>
          </div>

          {loading ? (
            <ProfileLoading />
          ) : profileData ? (
            <ProfileContent 
              profileData={profileData}
              hasTempProfile={hasTempData}
              handleRetakeQuestionnaire={handleRetakeQuestionnaire}
              handleSaveProfile={saveProfile}
              navigate={path => window.location.href = path}
              isLoggedIn={!!user}
            />
          ) : (
            <ProfileEmptyState navigate={path => window.location.href = path} />
          )}
        </div>
      </div>
      <BottomNavbar />
    </div>
  );
};

export default ProfileAnalysis;
