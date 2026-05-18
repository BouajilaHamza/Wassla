import 'dart:async';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../models/cluster.dart';
import '../services/api_service.dart';

class LocationProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  // User position (centered in Houmt Souk, Djerba, Tunisia)
  double _userLat = 33.8750;
  double _userLng = 10.8570;
  double _userSpeed = 0.0;
  double _userHeading = 0.0;

  double get userLat => _userLat;
  double get userLng => _userLng;
  double get userSpeed => _userSpeed;
  double get userHeading => _userHeading;

  // App State
  bool _isTracking = false;
  int _userPoints = 45; // Start with some initial points
  bool get isTracking => _isTracking;
  int get userPoints => _userPoints;

  // Active buses / clusters
  List<BusCluster> _activeBuses = [];
  List<BusCluster> get activeBuses => _activeBuses;

  // Confirmation state
  BusCluster? _nearbyClusterToConfirm;
  BusCluster? get nearbyClusterToConfirm => _nearbyClusterToConfirm;
  final Set<String> _confirmedClusterIds = {};

  // Timers
  Timer? _locationTimer;
  Timer? _pointsTimer;
  Timer? _simulationTimer;

  // Simulation controls
  bool _isSimulatingRide = false;
  bool get isSimulatingRide => _isSimulatingRide;

  LocationProvider() {
    // Initial fetch of clusters
    fetchBuses();
  }

  // Deduct points when redeeming vouchers
  void deductPoints(int amount) {
    if (_userPoints >= amount) {
      _userPoints -= amount;
      notifyListeners();
    }
  }

  // Toggle background tracking
  void toggleTracking() {
    _isTracking = !_isTracking;
    if (_isTracking) {
      _startTrackingTimers();
    } else {
      _stopTrackingTimers();
    }
    notifyListeners();
  }

  void _startTrackingTimers() {
    // Ping location to backend every 10 seconds
    _locationTimer = Timer.periodic(const Duration(seconds: 10), (timer) async {
      await _pingLocation();
      await fetchBuses();
    });

    // 1 point per 10 seconds in demo/simulation speed (1 point/min in spec)
    _pointsTimer = Timer.periodic(const Duration(seconds: 10), (timer) {
      _userPoints += 1;
      notifyListeners();
    });
  }

  void _stopTrackingTimers() {
    _locationTimer?.cancel();
    _pointsTimer?.cancel();
  }

  // Force fetch clusters
  Future<void> fetchBuses() async {
    _activeBuses = await _apiService.getClusters(
      userLat: _isSimulatingRide ? null : _userLat,
      userLng: _isSimulatingRide ? null : _userLng,
    );

    // Check if user is near a cluster to trigger bus confirmation dialog
    if (_isTracking && _nearbyClusterToConfirm == null) {
      _checkForNearbyBuses();
    }

    notifyListeners();
  }

  // Verify distance to buses
  void _checkForNearbyBuses() {
    for (var bus in _activeBuses) {
      if (_confirmedClusterIds.contains(bus.id)) continue;

      // Distance calculation (haversine)
      final double distance = _calculateDistance(_userLat, _userLng, bus.lat, bus.lng);
      if (distance <= 40.0) { // inside 40 meters
        _nearbyClusterToConfirm = bus;
        notifyListeners();
        break;
      }
    }
  }

  double _calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    const double r = 6371000; // Earth radius in meters
    final double dLat = (lat2 - lat1) * pi / 180;
    final double dLon = (lon2 - lon1) * pi / 180;
    final double a = sin(dLat / 2) * sin(dLat / 2) +
        cos(lat1 * pi / 180) * cos(lat2 * pi / 180) *
        sin(dLon / 2) * sin(dLon / 2);
    final double c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return r * c;
  }

  // Ping location to real API
  Future<void> _pingLocation() async {
    await _apiService.postLocation(
      userId: 'community_wassla_user_1',
      lat: _userLat,
      lng: _userLng,
      speed: _userSpeed,
      heading: _userHeading,
    );
  }

  // Handle bus presence feedback
  Future<void> confirmPresence(bool isOnBus) async {
    if (_nearbyClusterToConfirm == null) return;

    final String busId = _nearbyClusterToConfirm!.id;
    _confirmedClusterIds.add(busId);

    // Call API
    await _apiService.confirmBus(busId, isOnBus);

    if (isOnBus) {
      _userPoints += 10; // 10 points for bus confirmation!
    }

    _nearbyClusterToConfirm = null;
    notifyListeners();
  }

  void dismissConfirmation() {
    if (_nearbyClusterToConfirm != null) {
      _confirmedClusterIds.add(_nearbyClusterToConfirm!.id);
      _nearbyClusterToConfirm = null;
      notifyListeners();
    }
  }

  // Toggle user movement simulation (dev mode only)
  void toggleRideSimulation() {
    if (!kDebugMode) return;

    _isSimulatingRide = !_isSimulatingRide;
    if (_isSimulatingRide) {
      // Start moving the user along Houmt Souk - Midoun route
      double targetLat = 33.8068; // Midoun
      double targetLng = 10.9950;
      double speedFactor = 0.0003; // speed of simulation

      _simulationTimer = Timer.periodic(const Duration(milliseconds: 200), (timer) {
        if (!_isSimulatingRide) {
          timer.cancel();
          return;
        }

        final double dy = targetLat - _userLat;
        final double dx = targetLng - _userLng;
        final double dist = sqrt(dy * dy + dx * dx);

        if (dist < 0.001) {
          // Reached Midoun! Stop simulation
          _isSimulatingRide = false;
          _userSpeed = 0.0;
          timer.cancel();
          notifyListeners();
          return;
        }

        // Steer user position
        _userHeading = atan2(dx, dy) * 180 / pi;
        _userLat += (dy / dist) * speedFactor;
        _userLng += (dx / dist) * speedFactor;
        _userSpeed = 45.0; // 45 km/h simulated ride speed

        // Check for clusters under current movement
        _checkForNearbyBuses();
        notifyListeners();
      });
    } else {
      _simulationTimer?.cancel();
      _userSpeed = 0.0;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _stopTrackingTimers();
    _simulationTimer?.cancel();
    super.dispose();
  }
}
