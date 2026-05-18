import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/location_provider.dart';

class RewardsScreen extends StatefulWidget {
  const RewardsScreen({super.key});

  @override
  State<RewardsScreen> createState() => _RewardsScreenState();
}

class _RewardsScreenState extends State<RewardsScreen> {
  final List<Map<String, dynamic>> _vouchers = [
    {
      'id': 'v_houmt_souk',
      'title': 'HOUMT SOUK LOCAL',
      'points': 50,
      'description': 'Valid for any single transit route within Houmt Souk municipality.',
      'icon': Icons.confirmation_number_rounded,
    },
    {
      'id': 'v_midoun_transit',
      'title': 'MIDOUN TRANSIT PASS',
      'points': 75,
      'description': 'Valid for one transit trip on the Houmt Souk ⇆ Midoun line.',
      'icon': Icons.local_activity_rounded,
    },
    {
      'id': 'v_djerba_day_pass',
      'title': 'DJERBA ISLAND DAY PASS',
      'points': 150,
      'description': 'Unlimited bus rides across Djerba routes for 24 hours.',
      'icon': Icons.stars_rounded,
    },
  ];

  final Map<String, String> _redeemedVouchers = {};

  void _handleRedeem(LocationProvider provider, Map<String, dynamic> voucher) {
    final int pointsNeeded = voucher['points'] as int;
    final String id = voucher['id'] as String;

    if (provider.userPoints < pointsNeeded) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Insufficient points for this transit pass.', style: GoogleFonts.inter()),
          backgroundColor: const Color(0xFF111111),
        ),
      );
      return;
    }

    final String code = 'WSSLA-${1000 + (id.hashCode % 9000)}';
    
    setState(() {
      _redeemedVouchers[id] = code;
    });

    provider.deductPoints(pointsNeeded);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Successfully redeemed ${voucher['title']}.', style: GoogleFonts.inter()),
        backgroundColor: const Color(0xFF111111),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final locationProvider = Provider.of<LocationProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text('REWARDS', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, letterSpacing: 2)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildPointsBalanceCard(locationProvider),
            const SizedBox(height: 48),

            Text(
              'TRANSIT PASSES',
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.5,
                color: const Color(0xFF111111).withOpacity(0.4),
              ),
            ),
            const SizedBox(height: 24),

            ..._vouchers.map((voucher) {
              final id = voucher['id'] as String;
              final redeemedCode = _redeemedVouchers[id];
              return _buildVoucherCard(context, voucher, redeemedCode, () => _handleRedeem(locationProvider, voucher));
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildPointsBalanceCard(LocationProvider provider) {
    final double progress = (provider.userPoints / 150.0).clamp(0.0, 1.0);

    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 30,
            offset: const Offset(0, 15),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'CURRENT BALANCE',
            style: GoogleFonts.inter(
              color: Colors.white.withOpacity(0.4),
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                '${provider.userPoints}',
                style: GoogleFonts.outfit(
                  color: Colors.white,
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'PTS',
                style: GoogleFonts.inter(
                  color: Colors.white.withOpacity(0.3),
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'NEXT MILESTONE',
                style: GoogleFonts.inter(
                  color: Colors.white.withOpacity(0.4),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                '${(progress * 100).toInt()}%',
                style: GoogleFonts.inter(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.white.withOpacity(0.1),
              valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
              minHeight: 4,
            ),
          )
        ],
      ),
    );
  }

  Widget _buildVoucherCard(
    BuildContext context,
    Map<String, dynamic> voucher,
    String? redeemedCode,
    VoidCallback onRedeem,
  ) {
    final int points = voucher['points'] as int;

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF111111).withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                voucher['title'] as String,
                style: GoogleFonts.outfit(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF111111),
                ),
              ),
              if (redeemedCode == null)
                Text(
                  '$points PTS',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF111111).withOpacity(0.4),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            voucher['description'] as String,
            style: GoogleFonts.inter(
              fontSize: 13,
              color: const Color(0xFF111111).withOpacity(0.5),
              height: 1.4,
            ),
          ),
          const SizedBox(height: 24),
          if (redeemedCode != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFAFAFA),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF111111).withOpacity(0.1)),
              ),
              child: Column(
                children: [
                  Text(
                    'REDEMPTION CODE',
                    style: GoogleFonts.inter(
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                      color: const Color(0xFF111111).withOpacity(0.4),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    redeemedCode,
                    style: GoogleFonts.outfit(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                      color: const Color(0xFF111111),
                    ),
                  ),
                ],
              ),
            )
          else
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onRedeem,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFAFAFA),
                  foregroundColor: const Color(0xFF111111),
                  side: BorderSide(color: const Color(0xFF111111).withOpacity(0.1)),
                ),
                child: const Text('REDEEM PASS'),
              ),
            )
        ],
      ),
    );
  }
}
