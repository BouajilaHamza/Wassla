import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/location_provider.dart';
import 'screens/auth_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LocationProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Wassla Design Tokens
    const Color obsidianBlack = Color(0xFF111111);
    const Color alabasterWhite = Color(0xFFFAFAFA);

    return MaterialApp(
      title: 'Wassla',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: alabasterWhite,
        colorScheme: ColorScheme.fromSeed(
          seedColor: obsidianBlack,
          primary: obsidianBlack,
          surface: alabasterWhite,
          onPrimary: Colors.white,
          onSurface: obsidianBlack,
        ),
        textTheme: GoogleFonts.interTextTheme().copyWith(
          displayLarge: GoogleFonts.outfit(
            fontWeight: FontWeight.bold,
            color: obsidianBlack,
          ),
          displayMedium: GoogleFonts.outfit(
            fontWeight: FontWeight.bold,
            color: obsidianBlack,
          ),
          headlineMedium: GoogleFonts.outfit(
            fontWeight: FontWeight.w600,
            color: obsidianBlack,
          ),
          labelLarge: GoogleFonts.inter(
            fontWeight: FontWeight.w500,
            letterSpacing: 0.5,
            fontSize: 12,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: obsidianBlack,
            foregroundColor: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 32),
            textStyle: GoogleFonts.outfit(
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          contentPadding:
              const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: obsidianBlack.withValues(alpha: 0.1)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: obsidianBlack, width: 1.5),
          ),
          hintStyle:
              GoogleFonts.inter(color: obsidianBlack.withValues(alpha: 0.3)),
        ),
        cardTheme: CardThemeData(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
            side: BorderSide(color: obsidianBlack.withValues(alpha: 0.05)),
          ),
        ),
      ),
      home: const AuthScreen(),
    );
  }
}
