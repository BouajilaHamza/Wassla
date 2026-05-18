import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../providers/location_provider.dart';
import '../models/cluster.dart';
import 'rewards_screen.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen>
    with SingleTickerProviderStateMixin {
  final MapController _mapController = MapController();
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final locationProvider = Provider.of<LocationProvider>(context);

    if (locationProvider.isSimulatingRide) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _mapController.move(
          LatLng(locationProvider.userLat, locationProvider.userLng),
          _mapController.camera.zoom,
        );
      });
    }

    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      body: Stack(
        children: [
          // Luminous Map Layer
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter:
                  LatLng(locationProvider.userLat, locationProvider.userLng),
              initialZoom: 13.5,
              minZoom: 10.0,
              maxZoom: 18.0,
            ),
            children: [
              TileLayer(
                urlTemplate:
                    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                subdomains: const ['a', 'b', 'c', 'd'],
                userAgentPackageName: 'com.wassla.app',
              ),
              MarkerLayer(
                markers: [
                  // Hardware-Precise User Marker
                  Marker(
                    width: 60,
                    height: 60,
                    point: LatLng(
                        locationProvider.userLat, locationProvider.userLng),
                    child: AnimatedBuilder(
                      animation: _pulseController,
                      builder: (context, child) {
                        return Stack(
                          alignment: Alignment.center,
                          children: [
                            Container(
                              width: 12 + (40 * _pulseController.value),
                              height: 12 + (40 * _pulseController.value),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: const Color(0xFF111111).withValues(
                                    alpha: 0.1 * (1 - _pulseController.value)),
                              ),
                            ),
                            Container(
                              width: 14,
                              height: 14,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: const Color(0xFF111111),
                                border:
                                    Border.all(color: Colors.white, width: 2),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.1),
                                    blurRadius: 10,
                                  )
                                ],
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),

                  // Monochrome Bus Markers
                  ...locationProvider.activeBuses.map((bus) {
                    return Marker(
                      width: 55,
                      height: 55,
                      point: LatLng(bus.lat, bus.lng),
                      child: GestureDetector(
                        onTap: () {
                          _showBusDetails(context, bus);
                        },
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            Container(
                              width: 38,
                              height: 38,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white,
                                border: Border.all(
                                    color: const Color(0xFF111111), width: 1.5),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.04),
                                    blurRadius: 12,
                                    spreadRadius: 4,
                                  )
                                ],
                              ),
                              child: const Icon(
                                Icons.directions_bus_filled_rounded,
                                size: 18,
                                color: Color(0xFF111111),
                              ),
                            ),
                            Positioned(
                              top: 0,
                              right: 0,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF111111),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  '${bus.userCount}',
                                  style: GoogleFonts.inter(
                                    color: Colors.white,
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ],
          ),

          // Upper Interface
          Positioned(
            top: 60,
            left: 20,
            right: 20,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildTrackerBadge(locationProvider),
                _buildPointsBadge(context, locationProvider),
              ],
            ),
          ),

          // Simulation Controls (dev mode only)
          if (kDebugMode)
            Positioned(
              bottom: 260,
              right: 20,
              child: _buildSimulationController(locationProvider),
            ),

          // Bottom Monolith Panel
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: _buildBottomPanel(context, locationProvider),
          ),

          // Confirmation Overlay
          if (locationProvider.nearbyClusterToConfirm != null)
            Positioned(
              top: 130,
              left: 20,
              right: 20,
              child: _buildConfirmationCard(locationProvider),
            ),
        ],
      ),
    );
  }

  Widget _buildTrackerBadge(LocationProvider provider) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border:
            Border.all(color: const Color(0xFF111111).withValues(alpha: 0.05)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 20,
          )
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: provider.isTracking ? Colors.green : Colors.red,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            provider.isTracking ? 'RADAR ACTIVE' : 'RADAR OFF',
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.0,
              color: const Color(0xFF111111),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPointsBadge(BuildContext context, LocationProvider provider) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const RewardsScreen()),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF111111),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.bolt_rounded, color: Colors.white, size: 16),
            const SizedBox(width: 4),
            Text(
              '${provider.userPoints} PTS',
              style: GoogleFonts.outfit(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSimulationController(LocationProvider provider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        GestureDetector(
          onTap: () {
            _mapController.move(
                LatLng(provider.userLat, provider.userLng), 14.0);
          },
          child: Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                  color: const Color(0xFF111111).withValues(alpha: 0.05)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 10,
                )
              ],
            ),
            child: const Icon(Icons.near_me_rounded,
                size: 18, color: Color(0xFF111111)),
          ),
        ),
        const SizedBox(height: 12),
        GestureDetector(
          onTap: provider.toggleRideSimulation,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: provider.isSimulatingRide
                  ? const Color(0xFF111111)
                  : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                  color: const Color(0xFF111111).withValues(alpha: 0.05)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 10,
                )
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  provider.isSimulatingRide
                      ? Icons.auto_mode_rounded
                      : Icons.play_arrow_rounded,
                  size: 16,
                  color: provider.isSimulatingRide
                      ? Colors.white
                      : const Color(0xFF111111),
                ),
                const SizedBox(width: 8),
                Text(
                  provider.isSimulatingRide ? 'SIMULATING' : 'TEST RIDE',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: provider.isSimulatingRide
                        ? Colors.white
                        : const Color(0xFF111111),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildConfirmationCard(LocationProvider provider) {
    final bus = provider.nearbyClusterToConfirm!;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.sensors_rounded,
                    color: Color(0xFF111111), size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'PULSE DETECTED',
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.5,
                          color: const Color(0xFF111111).withValues(alpha: 0.4),
                        ),
                      ),
                      Text(
                        bus.routeName,
                        style: GoogleFonts.outfit(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF111111),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Are you currently on this bus? Confirm to help the community.',
              style: GoogleFonts.inter(
                color: const Color(0xFF111111).withValues(alpha: 0.6),
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => provider.confirmPresence(false),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(
                          color:
                              const Color(0xFF111111).withValues(alpha: 0.1)),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: Text('NO',
                        style: GoogleFonts.inter(
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF111111))),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => provider.confirmPresence(true),
                    child: const Text('CONFIRM'),
                  ),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildBottomPanel(BuildContext context, LocationProvider provider) {
    return Container(
      height: 240,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 40,
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 12),
          Center(
            child: Container(
              width: 32,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFF111111).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'ACTIVE RADAR',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                        color: const Color(0xFF111111).withValues(alpha: 0.4),
                      ),
                    ),
                    Text(
                      '${provider.activeBuses.length} detections',
                      style: GoogleFonts.outfit(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF111111),
                      ),
                    ),
                  ],
                ),
                Switch.adaptive(
                  value: provider.isTracking,
                  onChanged: (_) => provider.toggleTracking(),
                  activeTrackColor: const Color(0xFF111111),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: provider.activeBuses.isEmpty
                ? Center(
                    child: Text(
                      'SCANNING FOR PULSE...',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        letterSpacing: 1.5,
                        color: const Color(0xFF111111).withValues(alpha: 0.2),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  )
                : ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    itemCount: provider.activeBuses.length,
                    itemBuilder: (context, index) {
                      final bus = provider.activeBuses[index];
                      return _buildBusCard(context, bus);
                    },
                  ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildBusCard(BuildContext context, BusCluster bus) {
    return GestureDetector(
      onTap: () {
        _mapController.move(LatLng(bus.lat, bus.lng), 14.0);
        _showBusDetails(context, bus);
      },
      child: Container(
        width: 180,
        margin: const EdgeInsets.only(right: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFFFAFAFA),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
              color: const Color(0xFF111111).withValues(alpha: 0.05)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Icon(Icons.sensors_rounded,
                    size: 16, color: Color(0xFF111111)),
                Text(
                  '${bus.userCount} TRK',
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF111111).withValues(alpha: 0.4),
                  ),
                ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  bus.routeName.toUpperCase(),
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF111111),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  '${bus.speed.toStringAsFixed(0)} KM/H',
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF111111).withValues(alpha: 0.3),
                  ),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  void _showBusDetails(BuildContext context, BusCluster bus) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(32))),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'BUS IDENTIFIED',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                    color: const Color(0xFF111111).withValues(alpha: 0.4),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  bus.routeName,
                  style: GoogleFonts.outfit(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF111111),
                  ),
                ),
                const SizedBox(height: 24),
                _buildModalRow(Icons.speed_rounded, 'VELOCITY',
                    '${bus.speed.toStringAsFixed(0)} KM/H'),
                const Divider(height: 24),
                _buildModalRow(Icons.people_rounded, 'ACTIVE TRACKERS',
                    '${bus.userCount} PASSENGERS'),
                const Divider(height: 24),
                _buildModalRow(
                    Icons.verified_user_rounded, 'CONFIDENCE', '98.5%'),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('DISMISS'),
                  ),
                )
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildModalRow(IconData icon, String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(icon,
                color: const Color(0xFF111111).withValues(alpha: 0.3),
                size: 18),
            const SizedBox(width: 12),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF111111).withValues(alpha: 0.4),
              ),
            ),
          ],
        ),
        Text(
          value,
          style: GoogleFonts.outfit(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF111111),
          ),
        ),
      ],
    );
  }
}
