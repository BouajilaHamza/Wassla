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

  // Flow & State Variables
  bool _showOnboarding = true; // Show tutorial immediately upon login
  String? _selectedRouteName; // Route filtering (null = all lines)

  // Pre-configured Djerba route coordinates
  final Map<String, List<LatLng>> _routeCoords = {
    'Line 10 (Houmt Souk ⇆ Midoun)': const [
      LatLng(33.8767, 10.8550),
      LatLng(33.8600, 10.8900),
      LatLng(33.8400, 10.9300),
      LatLng(33.8068, 10.9950),
    ],
    'Line 15 (Houmt Souk ⇆ Guellala)': const [
      LatLng(33.8767, 10.8550),
      LatLng(33.8300, 10.8200),
      LatLng(33.7800, 10.8000),
      LatLng(33.7297, 10.8553),
    ],
    'Line 22 (Midoun ⇆ Guellala)': const [
      LatLng(33.8068, 10.9950),
      LatLng(33.7600, 10.9700),
      LatLng(33.7400, 10.9200),
      LatLng(33.7297, 10.8553),
    ],
  };

  // Bus stops along the routes
  final Map<String, List<Map<String, dynamic>>> _routeStops = {
    'Line 10 (Houmt Souk ⇆ Midoun)': const [
      {'name': 'Houmt Souk Terminal', 'lat': 33.8767, 'lng': 10.8550},
      {'name': 'Sidi Zayed Stop', 'lat': 33.8600, 'lng': 10.8900},
      {'name': 'Tezdaine Stop', 'lat': 33.8400, 'lng': 10.9300},
      {'name': 'Midoun Center', 'lat': 33.8068, 'lng': 10.9950},
    ],
    'Line 15 (Houmt Souk ⇆ Guellala)': const [
      {'name': 'Houmt Souk Terminal', 'lat': 33.8767, 'lng': 10.8550},
      {'name': 'Erriadh Stop', 'lat': 33.8300, 'lng': 10.8200},
      {'name': 'Cedouikech Stop', 'lat': 33.7800, 'lng': 10.8000},
      {'name': 'Guellala Museum', 'lat': 33.7297, 'lng': 10.8553},
    ],
    'Line 22 (Midoun ⇆ Guellala)': const [
      {'name': 'Midoun Center', 'lat': 33.8068, 'lng': 10.9950},
      {'name': 'Aghir Stop', 'lat': 33.7600, 'lng': 10.9700},
      {'name': 'El Kantara Stop', 'lat': 33.7400, 'lng': 10.9200},
      {'name': 'Guellala Museum', 'lat': 33.7297, 'lng': 10.8553},
    ],
  };

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

  // Focus and zoom map to center of selected route
  void _onRouteSelected(String? routeName) {
    setState(() {
      _selectedRouteName = routeName;
    });

    if (routeName != null) {
      final coords = _routeCoords[routeName];
      if (coords != null && coords.isNotEmpty) {
        double avgLat = coords.map((e) => e.latitude).reduce((a, b) => a + b) /
            coords.length;
        double avgLng = coords.map((e) => e.longitude).reduce((a, b) => a + b) /
            coords.length;
        _mapController.move(LatLng(avgLat, avgLng), 13.0);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final locationProvider = Provider.of<LocationProvider>(context);

    // Auto-move camera when simulating transit ride
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
              initialZoom: 13.0,
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

              // Route Polylines
              PolylineLayer(
                polylines: _routeCoords.entries.map<Polyline<Object>>((entry) {
                  final isSelected = entry.key == _selectedRouteName;
                  return Polyline(
                    points: entry.value,
                    strokeWidth: isSelected ? 5.0 : 2.5,
                    color: isSelected
                        ? const Color(0xFF111111)
                        : const Color(0xFF111111).withValues(alpha: 0.15),
                    pattern: isSelected
                        ? const StrokePattern.solid()
                        : StrokePattern.dashed(segments: const [6, 4]),
                  );
                }).toList(),
              ),

              // Stop Markers & Bus Markers
              MarkerLayer(
                markers: [
                  // Bus Stop Labels (Only for Selected Route)
                  if (_selectedRouteName != null)
                    ...(_routeStops[_selectedRouteName] ?? []).map((stop) {
                      return Marker(
                        width: 120,
                        height: 55,
                        point: LatLng(
                            stop['lat'] as double, stop['lng'] as double),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF111111),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                stop['name'] as String,
                                style: GoogleFonts.inter(
                                  color: Colors.white,
                                  fontSize: 8,
                                  fontWeight: FontWeight.bold,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white,
                                border: Border.all(
                                    color: const Color(0xFF111111), width: 2),
                              ),
                            ),
                          ],
                        ),
                      );
                    }),

                  // User Pulsing Pin
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
                                    alpha: 0.12 * (1 - _pulseController.value)),
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

                  // Active Buses
                  ...locationProvider.activeBuses
                      .where((bus) =>
                          _selectedRouteName == null ||
                          bus.routeName == _selectedRouteName)
                      .map((bus) {
                    return Marker(
                      width: 55,
                      height: 55,
                      point: LatLng(bus.lat, bus.lng),
                      child: GestureDetector(
                        onTap: () => _showBusDetails(context, bus),
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            // Concentric Pulse waves representing active signal
                            Container(
                              width: 50,
                              height: 50,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: const Color(0xFF111111)
                                      .withValues(alpha: 0.08),
                                  width: 1,
                                ),
                              ),
                            ),
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
                                    color: Colors.black.withValues(alpha: 0.05),
                                    blurRadius: 12,
                                    spreadRadius: 2,
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

          // Upper Interface (Badges & Settings)
          Positioned(
            top: 60,
            left: 20,
            right: 20,
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildTrackerBadge(locationProvider),
                    _buildPointsBadge(context, locationProvider),
                  ],
                ),
                const SizedBox(height: 16),
                _buildRouteSelectorPills(), // Transit Line filter pills
              ],
            ),
          ),

          // Floating Controls (Help, Camera Recenter)
          Positioned(
            bottom: locationProvider.isSimulatingRide ? 260 : 260,
            right: 20,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                // Help / Onboarding re-trigger Button
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _showOnboarding = true;
                    });
                  },
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      border: Border.all(
                          color:
                              const Color(0xFF111111).withValues(alpha: 0.08)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 10,
                        )
                      ],
                    ),
                    child: const Icon(Icons.help_outline_rounded,
                        size: 20, color: Color(0xFF111111)),
                  ),
                ),
                const SizedBox(height: 12),

                // Recenter Camera Button
                GestureDetector(
                  onTap: () {
                    _mapController.move(
                        LatLng(
                            locationProvider.userLat, locationProvider.userLng),
                        14.0);
                  },
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      border: Border.all(
                          color:
                              const Color(0xFF111111).withValues(alpha: 0.08)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 10,
                        )
                      ],
                    ),
                    child: const Icon(Icons.near_me_rounded,
                        size: 20, color: Color(0xFF111111)),
                  ),
                ),
              ],
            ),
          ),

          // Bottom Sheet Panel (Standard or Ride Simulator)
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: locationProvider.isSimulatingRide
                ? _buildSimulationDashboard(context, locationProvider)
                : _buildBottomPanel(context, locationProvider),
          ),

          // Presence Confirmation Dialog
          if (locationProvider.nearbyClusterToConfirm != null)
            Positioned(
              top: 130,
              left: 20,
              right: 20,
              child: _buildConfirmationCard(locationProvider),
            ),

          // Tutorial / Onboarding Overlay
          if (_showOnboarding) _buildTutorialOverlay(),
        ],
      ),
    );
  }

  // Route selector pills scroll view
  Widget _buildRouteSelectorPills() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildPill(null, '🗺️ All Lines'),
          ..._routeCoords.keys.map((routeName) {
            final shortName = routeName.split('(')[0].trim();
            return _buildPill(routeName, '🚌 $shortName');
          }),
        ],
      ),
    );
  }

  Widget _buildPill(String? routeName, String label) {
    final isSelected = _selectedRouteName == routeName;
    return GestureDetector(
      onTap: () => _onRouteSelected(routeName),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF111111) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? Colors.transparent
                : const Color(0xFF111111).withValues(alpha: 0.1),
          ),
          boxShadow: [
            if (!isSelected)
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 10,
              )
          ],
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            color: isSelected ? Colors.white : const Color(0xFF111111),
            fontSize: 11,
            fontWeight: FontWeight.bold,
          ),
        ),
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

  // Presence verification prompt
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

  // Normal bottom panel with active buses list
  Widget _buildBottomPanel(BuildContext context, LocationProvider provider) {
    final filteredBuses = provider.activeBuses
        .where((bus) =>
            _selectedRouteName == null || bus.routeName == _selectedRouteName)
        .toList();

    return Container(
      height: 245,
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
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _selectedRouteName != null
                          ? 'SELECTED LINE RADAR'
                          : 'ACTIVE RADAR',
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                        color: const Color(0xFF111111).withValues(alpha: 0.4),
                      ),
                    ),
                    Text(
                      '${filteredBuses.length} buses detected',
                      style: GoogleFonts.outfit(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF111111),
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    Text(
                      provider.isTracking ? 'SHARING' : 'STOPPED',
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                        color: provider.isTracking
                            ? Colors.green
                            : const Color(0xFF111111).withValues(alpha: 0.4),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Switch.adaptive(
                      value: provider.isTracking,
                      onChanged: (_) => provider.toggleTracking(),
                      activeTrackColor: const Color(0xFF111111),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 24),
              // We inject the Demo Simulator Card first in the list to make it obvious
              itemCount: filteredBuses.length + 1,
              itemBuilder: (context, index) {
                if (index == 0) {
                  return _buildDemoInviteCard(provider);
                }
                final bus = filteredBuses[index - 1];
                return _buildBusCard(context, bus);
              },
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  // Interactive Demo card to launch simulation
  Widget _buildDemoInviteCard(LocationProvider provider) {
    return Container(
      width: 180,
      margin: const EdgeInsets.only(right: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 15,
            offset: const Offset(0, 5),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Icon(Icons.auto_mode_rounded,
                  size: 16, color: Colors.white),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  'DEMO',
                  style: GoogleFonts.inter(
                    color: Colors.white,
                    fontSize: 8,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'TEST WASSLA',
                style: GoogleFonts.outfit(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                height: 32,
                child: ElevatedButton(
                  onPressed: () {
                    // Turn on radar tracking and start ride simulation
                    if (!provider.isTracking) {
                      provider.toggleTracking();
                    }
                    provider.toggleRideSimulation();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF111111),
                    padding: EdgeInsets.zero,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(
                    'START RIDE',
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          )
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
                    fontSize: 13,
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

  // Dashboard displayed when a Demo Ride simulation is running
  Widget _buildSimulationDashboard(
      BuildContext context, LocationProvider provider) {
    // Houmt Souk lat = 33.8750, Midoun lat = 33.8068
    // Calculate progress fraction
    final progress =
        ((33.8750 - provider.userLat) / (33.8750 - 33.8068)).clamp(0.0, 1.0);

    return Container(
      height: 245,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 40,
            offset: const Offset(0, -10),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.green,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'DEMO RIDE ACTIVE',
                    style: GoogleFonts.inter(
                      color: Colors.green,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${provider.userSpeed.toStringAsFixed(0)} KM/H',
                  style: GoogleFonts.outfit(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Line 10 (Houmt Souk ⇆ Midoun)',
                style: GoogleFonts.outfit(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Houmt Souk',
                    style: GoogleFonts.inter(
                      color: Colors.white.withValues(alpha: 0.4),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'Midoun',
                    style: GoogleFonts.inter(
                      color: Colors.white.withValues(alpha: 0.4),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: 6,
                  backgroundColor: Colors.white.withValues(alpha: 0.1),
                  valueColor: const AlwaysStoppedAnimation<Color>(Colors.green),
                ),
              ),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.bolt_rounded, color: Colors.white, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    'Earning: +1 PTS / 10s',
                    style: GoogleFonts.inter(
                      color: Colors.white.withValues(alpha: 0.6),
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              ElevatedButton(
                onPressed: () {
                  provider.toggleRideSimulation();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('STOP RIDE'),
              ),
            ],
          ),
        ],
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

  // Tutorial/Onboarding full-screen card overlay
  Widget _buildTutorialOverlay() {
    return Container(
      color: Colors.black.withValues(alpha: 0.7),
      width: double.infinity,
      height: double.infinity,
      alignment: Alignment.center,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 24),
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(30),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.2),
              blurRadius: 30,
            )
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header Logo
            Container(
              width: 64,
              height: 64,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0xFF111111),
              ),
              child: const Icon(
                Icons.sensors_rounded,
                color: Colors.white,
                size: 32,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'WELCOME TO WASSLA',
              style: GoogleFonts.outfit(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF111111),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              "Djerba's real-time transit tracker. Wassla is powered by the community. Here is how to use it:",
              style: GoogleFonts.inter(
                fontSize: 13,
                color: const Color(0xFF111111).withValues(alpha: 0.5),
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),

            // Step 1
            _buildTutorialStep(
              Icons.portable_wifi_off_rounded,
              '1. TURN ON ACTIVE RADAR',
              'Toggle the Active Radar in the bottom panel. Your phone will securely share anonymous transit location data to track the bus lines.',
            ),
            const SizedBox(height: 16),

            // Step 2
            _buildTutorialStep(
              Icons.add_task_rounded,
              '2. CONFIRM PRESENCE & EARN',
              'When you are near or on a bus, confirm the verification prompt. You earn +1 Point every 10 seconds of tracking, and +10 Points for verification!',
            ),
            const SizedBox(height: 16),

            // Step 3
            _buildTutorialStep(
              Icons.card_giftcard_rounded,
              '3. REDEEM PASSES',
              'Tap your points balance to enter the Rewards center. Convert your points into real municipal transit tickets and Day Passes.',
            ),
            const SizedBox(height: 28),

            // Dismiss Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  setState(() {
                    _showOnboarding = false;
                  });
                },
                child: const Text("LET'S RIDE"),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTutorialStep(IconData icon, String title, String desc) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: const Color(0xFF111111), size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.outfit(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF111111),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                desc,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: const Color(0xFF111111).withValues(alpha: 0.6),
                  height: 1.3,
                ),
              ),
            ],
          ),
        )
      ],
    );
  }
}
