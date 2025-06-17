"use client"

import { useState } from "react"
import { User, Bell, Shield, Archive, LogOut, Camera, Edit3, Smartphone, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

interface SettingsViewProps {
  user: any
  onUpdateUser: (userData: any) => void
  onLogout: () => void
}

export function SettingsView({ user, onUpdateUser, onLogout }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState("profile")
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    nom: user.nom || "",
    description: user.description || "Salut ! J'utilise WhatsApp.",
    telephone: user.telephone || "",
  })

  const [privacySettings, setPrivacySettings] = useState({
    lastSeen: "everyone",
    profilePhoto: "everyone",
    about: "everyone",
    status: "everyone",
    readReceipts: true,
    groups: "everyone",
    liveLocation: "none",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    messageNotifications: true,
    showPreview: true,
    groupNotifications: true,
    callNotifications: true,
    sound: "default",
    vibration: true,
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    fingerprintLock: false,
    autoLock: "immediately",
    showSecurityNotifications: true,
  })

  const [appSettings, setAppSettings] = useState({
    theme: "dark",
    language: "fr",
    fontSize: "medium",
    autoDownloadPhotos: true,
    autoDownloadVideos: false,
    autoDownloadDocuments: false,
  })

  const handleSaveProfile = () => {
    onUpdateUser(profileData)
    setEditingProfile(false)
  }

  const ProfileSection = () => (
    <div className="space-y-6">
      <Card className="bg-[#2a3942] border-[#3b4a54]">
        <CardHeader>
          <CardTitle className="text-white">Profil</CardTitle>
          <CardDescription className="text-gray-400">Gérez vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-[#00a884] text-white text-2xl">
                  {user.nom?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 bg-[#00a884] hover:bg-[#00a884]/80"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white">{user.nom}</h3>
              <p className="text-sm text-gray-400">{user.telephone}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingProfile(!editingProfile)}
              className="text-[#00a884]"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>

          {editingProfile && (
            <div className="space-y-4 pt-4 border-t border-[#3b4a54]">
              <div>
                <Label htmlFor="nom" className="text-white">
                  Nom
                </Label>
                <Input
                  id="nom"
                  value={profileData.nom}
                  onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                  className="bg-[#3b4a54] border-[#4a5c6a] text-white"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={profileData.description}
                  onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                  className="bg-[#3b4a54] border-[#4a5c6a] text-white"
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveProfile} className="bg-[#00a884] hover:bg-[#00a884]/80">
                  Enregistrer
                </Button>
                <Button variant="outline" onClick={() => setEditingProfile(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const PrivacySection = () => (
    <div className="space-y-6">
      <Card className="bg-[#2a3942] border-[#3b4a54]">
        <CardHeader>
          <CardTitle className="text-white">Confidentialité</CardTitle>
          <CardDescription className="text-gray-400">Contrôlez qui peut voir vos informations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "lastSeen", label: "Vu pour la dernière fois" },
            { key: "profilePhoto", label: "Photo de profil" },
            { key: "about", label: "Description" },
            { key: "status", label: "Statut" },
            { key: "groups", label: "Groupes" },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <Label className="text-white">{setting.label}</Label>
              <Select
                value={privacySettings[setting.key as keyof typeof privacySettings] as string}
                onValueChange={(value) => setPrivacySettings({ ...privacySettings, [setting.key]: value })}
              >
                <SelectTrigger className="w-32 bg-[#3b4a54] border-[#4a5c6a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#3b4a54] border-[#4a5c6a]">
                  <SelectItem value="everyone" className="text-white">
                    Tout le monde
                  </SelectItem>
                  <SelectItem value="contacts" className="text-white">
                    Mes contacts
                  </SelectItem>
                  <SelectItem value="nobody" className="text-white">
                    Personne
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}

          <Separator className="bg-[#3b4a54]" />

          <div className="flex items-center justify-between">
            <Label className="text-white">Confirmations de lecture</Label>
            <Switch
              checked={privacySettings.readReceipts}
              onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, readReceipts: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const NotificationsSection = () => (
    <div className="space-y-6">
      <Card className="bg-[#2a3942] border-[#3b4a54]">
        <CardHeader>
          <CardTitle className="text-white">Notifications</CardTitle>
          <CardDescription className="text-gray-400">Personnalisez vos notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "messageNotifications", label: "Notifications de messages" },
            { key: "showPreview", label: "Aperçu des messages" },
            { key: "groupNotifications", label: "Notifications de groupe" },
            { key: "callNotifications", label: "Notifications d'appel" },
            { key: "vibration", label: "Vibration" },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <Label className="text-white">{setting.label}</Label>
              <Switch
                checked={notificationSettings[setting.key as keyof typeof notificationSettings] as boolean}
                onCheckedChange={(checked) =>
                  setNotificationSettings({ ...notificationSettings, [setting.key]: checked })
                }
              />
            </div>
          ))}

          <div className="flex items-center justify-between">
            <Label className="text-white">Son de notification</Label>
            <Select
              value={notificationSettings.sound}
              onValueChange={(value) => setNotificationSettings({ ...notificationSettings, sound: value })}
            >
              <SelectTrigger className="w-32 bg-[#3b4a54] border-[#4a5c6a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#3b4a54] border-[#4a5c6a]">
                <SelectItem value="default" className="text-white">
                  Par défaut
                </SelectItem>
                <SelectItem value="classic" className="text-white">
                  Classique
                </SelectItem>
                <SelectItem value="modern" className="text-white">
                  Moderne
                </SelectItem>
                <SelectItem value="none" className="text-white">
                  Aucun
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const SecuritySection = () => (
    <div className="space-y-6">
      <Card className="bg-[#2a3942] border-[#3b4a54]">
        <CardHeader>
          <CardTitle className="text-white">Sécurité</CardTitle>
          <CardDescription className="text-gray-400">Protégez votre compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Authentification à deux facteurs</Label>
              <p className="text-sm text-gray-400">Sécurisez votre compte avec un code PIN</p>
            </div>
            <Switch
              checked={securitySettings.twoFactorAuth}
              onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Verrouillage par empreinte</Label>
              <p className="text-sm text-gray-400">Utilisez votre empreinte pour déverrouiller</p>
            </div>
            <Switch
              checked={securitySettings.fingerprintLock}
              onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, fingerprintLock: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-white">Verrouillage automatique</Label>
            <Select
              value={securitySettings.autoLock}
              onValueChange={(value) => setSecuritySettings({ ...securitySettings, autoLock: value })}
            >
              <SelectTrigger className="w-32 bg-[#3b4a54] border-[#4a5c6a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#3b4a54] border-[#4a5c6a]">
                <SelectItem value="immediately" className="text-white">
                  Immédiatement
                </SelectItem>
                <SelectItem value="1min" className="text-white">
                  1 minute
                </SelectItem>
                <SelectItem value="5min" className="text-white">
                  5 minutes
                </SelectItem>
                <SelectItem value="30min" className="text-white">
                  30 minutes
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-white">Notifications de sécurité</Label>
            <Switch
              checked={securitySettings.showSecurityNotifications}
              onCheckedChange={(checked) =>
                setSecuritySettings({ ...securitySettings, showSecurityNotifications: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const AppSection = () => (
    <div className="space-y-6">
      <Card className="bg-[#2a3942] border-[#3b4a54]">
        <CardHeader>
          <CardTitle className="text-white">Application</CardTitle>
          <CardDescription className="text-gray-400">Personnalisez l'apparence et le comportement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white">Thème</Label>
            <Select
              value={appSettings.theme}
              onValueChange={(value) => setAppSettings({ ...appSettings, theme: value })}
            >
              <SelectTrigger className="w-32 bg-[#3b4a54] border-[#4a5c6a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#3b4a54] border-[#4a5c6a]">
                <SelectItem value="light" className="text-white">
                  Clair
                </SelectItem>
                <SelectItem value="dark" className="text-white">
                  Sombre
                </SelectItem>
                <SelectItem value="auto" className="text-white">
                  Automatique
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-white">Langue</Label>
            <Select
              value={appSettings.language}
              onValueChange={(value) => setAppSettings({ ...appSettings, language: value })}
            >
              <SelectTrigger className="w-32 bg-[#3b4a54] border-[#4a5c6a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#3b4a54] border-[#4a5c6a]">
                <SelectItem value="fr" className="text-white">
                  Français
                </SelectItem>
                <SelectItem value="en" className="text-white">
                  English
                </SelectItem>
                <SelectItem value="es" className="text-white">
                  Español
                </SelectItem>
                <SelectItem value="ar" className="text-white">
                  العربية
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-white">Taille de police</Label>
            <Select
              value={appSettings.fontSize}
              onValueChange={(value) => setAppSettings({ ...appSettings, fontSize: value })}
            >
              <SelectTrigger className="w-32 bg-[#3b4a54] border-[#4a5c6a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#3b4a54] border-[#4a5c6a]">
                <SelectItem value="small" className="text-white">
                  Petite
                </SelectItem>
                <SelectItem value="medium" className="text-white">
                  Moyenne
                </SelectItem>
                <SelectItem value="large" className="text-white">
                  Grande
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-[#3b4a54]" />

          <div className="space-y-3">
            <h4 className="text-white font-medium">Téléchargement automatique</h4>
            {[
              { key: "autoDownloadPhotos", label: "Photos" },
              { key: "autoDownloadVideos", label: "Vidéos" },
              { key: "autoDownloadDocuments", label: "Documents" },
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <Label className="text-white">{setting.label}</Label>
                <Switch
                  checked={appSettings[setting.key as keyof typeof appSettings] as boolean}
                  onCheckedChange={(checked) => setAppSettings({ ...appSettings, [setting.key]: checked })}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#2a3942] border-[#3b4a54]">
        <CardHeader>
          <CardTitle className="text-white">Stockage et données</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start text-white border-[#3b4a54]">
            <Download className="w-4 h-4 mr-2" />
            Exporter les données
          </Button>
          <Button variant="outline" className="w-full justify-start text-white border-[#3b4a54]">
            <Archive className="w-4 h-4 mr-2" />
            Gérer le stockage
          </Button>
          <Button variant="destructive" className="w-full justify-start">
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer toutes les données
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-[#2a3942] border-[#3b4a54]">
        <CardContent className="pt-6">
          <Button onClick={onLogout} variant="destructive" className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="flex-1 bg-[#0b141a] flex flex-col">
      <div className="p-4 border-b border-[#2a3942]">
        <h1 className="text-xl font-light text-white">Paramètres</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 bg-[#2a3942] mx-4 mt-4">
          <TabsTrigger value="profile" className="data-[state=active]:bg-[#00a884] data-[state=active]:text-white">
            <User className="w-4 h-4 mr-1" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-[#00a884] data-[state=active]:text-white">
            <Shield className="w-4 h-4 mr-1" />
            Confidentialité
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-[#00a884] data-[state=active]:text-white"
          >
            <Bell className="w-4 h-4 mr-1" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="app" className="data-[state=active]:bg-[#00a884] data-[state=active]:text-white">
            <Smartphone className="w-4 h-4 mr-1" />
            App
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="profile">
            <ProfileSection />
          </TabsContent>
          <TabsContent value="privacy">
            <PrivacySection />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationsSection />
          </TabsContent>
          <TabsContent value="app">
            <AppSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
