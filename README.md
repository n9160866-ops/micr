# HW Panel (Electron)

App de monitoring en temps réel :
- Température de chaque core CPU
- Vitesse des ventilateurs CPU, boîtier, GPU
- Température GPU (NVIDIA / AMD / Intel)

Architecture : un petit "helper" en C# (compilé en exe autonome) lit les capteurs via **LibreHardwareMonitorLib**, l'app Electron l'interroge toutes les 2 secondes et affiche les résultats.

## Obtenir le .exe (via GitHub Actions)

1. Crée un repository GitHub, puis push le contenu de ce dossier :
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TON_USER/TON_REPO.git
   git push -u origin main
   ```
2. Onglet **Actions** de ton repo → le workflow "Build HW Panel EXE" se lance automatiquement.
3. Une fois terminé (✅), ouvre le run → **Artifacts** → télécharge `HWPanel-exe`.
4. Dedans : un `.exe` **portable** (aucune installation requise, un seul fichier).

## Utilisation

- Lance l'exe **en tant qu'administrateur** (clic droit → Exécuter en tant qu'administrateur), sinon les capteurs ne remontent pas de données.
- Windows SmartScreen avertira car l'exe n'est pas signé — clique "Informations complémentaires" → "Exécuter quand même".

## Développement local (optionnel, nécessite Windows)

```
cd helper
dotnet publish helper.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o publish
# copier LibreHardwareMonitorLib.dll dans helper/publish/
cd ..
npm install
npm start
```

## Relancer un build manuellement

Onglet **Actions** → "Build HW Panel EXE" → bouton **Run workflow**.
