# Voice Announcement Call Feature - Final Setup for 8 AM Demo

## ✅ COMPLETED
- Backend API fully working (upload, create, send)
- Firebase credentials configured in backend
- Flutter code fully implemented (FCM, UI, audio player)
- All dependencies added to pubspec.yaml

## 🔴 REQUIRED TONIGHT (30 minutes)

### 1. Download Firebase Config Files (5 mins)
Go to: https://console.firebase.google.com/project/acadionai

**For Android:**
1. Project Settings → General → Your apps
2. Find Android app (com.example.teachers_app or your package name)
3. Download `google-services.json`
4. Place at: `apps/teachers_app/android/app/google-services.json`

**For iOS:**
1. Same location, find iOS app
2. Download `GoogleService-Info.plist`
3. Place at: `apps/teachers_app/ios/Runner/GoogleService-Info.plist`

### 2. Configure Android Build (10 mins)

Edit `apps/teachers_app/android/build.gradle`:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'  // Add this line
    }
}
```

Edit `apps/teachers_app/android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'  // Add at bottom
```

Edit `apps/teachers_app/android/app/src/main/AndroidManifest.xml`:
```xml
<manifest ...>
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT"/>
    
    <application ...>
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="voice_announcements"/>
    </application>
</manifest>
```

### 3. Update API Service Base URL (2 mins)

Edit `apps/teachers_app/lib/services/api_service.dart`:
```dart
// Change from localhost to your computer's IP
static const String baseUrl = 'http://YOUR_IP:8000/api/v1';
// Example: 'http://192.168.1.100:8000/api/v1'
```

Find your IP:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### 4. Build and Install App (10 mins)

```bash
cd /Users/apple/School-OS/apps/teachers_app
flutter clean
flutter pub get
flutter run
```

Or for release APK:
```bash
flutter build apk
# Install: apps/teachers_app/build/app/outputs/flutter-apk/app-release.apk
```

### 5. Test End-to-End (3 mins)

1. Open teacher app on phone
2. Login as teacher
3. Go to admin web → Communications → Voice Call Notification
4. Record and send announcement
5. **Phone should show full-screen call UI with audio playing**

## 🎯 DEMO DAY CHECKLIST (Morning at School)

### Before Principal Arrives:
- [ ] Backend server running: `cd backend && uvicorn app.main:app --reload`
- [ ] Frontend running: `cd apps/admin-web && npm run dev`
- [ ] Teacher phone connected to same WiFi
- [ ] Teacher app installed and logged in
- [ ] Test notification sent successfully

### Demo Flow:
1. **Show admin web**: "Here's where we create voice announcements"
2. **Record audio**: "Testing, this is a priority announcement"
3. **Select Teachers**: Show auto-select when voice call chosen
4. **Send**: Click "Send Now"
5. **Show phone**: Full-screen call appears immediately
6. **Play audio**: Audio plays automatically
7. **Highlight**: "Works even when app is closed or phone is locked"

## 🐛 Troubleshooting

**No notification on phone?**
- Check phone is on same network as backend
- Verify FCM token registered: Check backend logs
- Test Firebase from console: Cloud Messaging → Send test message

**Audio not playing?**
- Check audio URL is accessible: Open in browser
- Verify Supabase Storage bucket is public

**App crashes on startup?**
- Run `flutter clean && flutter pub get`
- Check Firebase config files are in correct locations
- View Android logs: `flutter logs`

## 📱 Expected Behavior

When admin sends voice announcement:
1. Phone receives FCM notification (even if app closed)
2. Full-screen call UI appears automatically
3. Audio plays immediately
4. Teacher can pause/resume/seek
5. Screen dismisses when audio ends or user clicks "Dismiss"

## ⏱️ Total Setup Time: 30 minutes
