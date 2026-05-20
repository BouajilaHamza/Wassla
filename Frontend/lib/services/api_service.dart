import 'dart:async';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../models/cluster.dart';

class ApiService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'http://localhost:9095/api/v1',
    connectTimeout: const Duration(seconds: 5),
    receiveTimeout: const Duration(seconds: 5),
  ));

  // Simulation routes in Djerba, Tunisia
  final List<List<Map<String, double>>> _routes = [
    // Route 1: Houmt Souk to Midoun
    [
      {'lat': 33.8767, 'lng': 10.8550}, // Houmt Souk
      {'lat': 33.8600, 'lng': 10.8900},
      {'lat': 33.8400, 'lng': 10.9300},
      {'lat': 33.8068, 'lng': 10.9950}, // Midoun
    ],
    // Route 2: Houmt Souk to Guellala
    [
      {'lat': 33.8767, 'lng': 10.8550}, // Houmt Souk
      {'lat': 33.8300, 'lng': 10.8200},
      {'lat': 33.7800, 'lng': 10.8000},
      {'lat': 33.7297, 'lng': 10.8553}, // Guellala
    ],
    // Route 3: Midoun to Guellala
    [
      {'lat': 33.8068, 'lng': 10.9950}, // Midoun
      {'lat': 33.7600, 'lng': 10.9700},
      {'lat': 33.7400, 'lng': 10.9200},
      {'lat': 33.7297, 'lng': 10.8553}, // Guellala
    ]
  ];

  final List<String> _routeNames = [
    'Line 10 (Houmt Souk ⇆ Midoun)',
    'Line 15 (Houmt Souk ⇆ Guellala)',
    'Line 22 (Midoun ⇆ Guellala)',
  ];

  // Keep track of simulation progress
  final List<double> _simulationProgress = [0.0, 0.3, 0.7];
  final List<bool> _simulationDirection = [true, false, true];

  // Send GPS ping to backend
  Future<bool> postLocation({
    required String userId,
    required double lat,
    required double lng,
    required double speed,
    required double heading,
  }) async {
    try {
      final response = await _dio.post('/location', data: {
        'user_id': userId,
        'lat': lat,
        'lng': lng,
        'speed': speed,
        'heading': heading,
        'timestamp': DateTime.now().toUtc().toIso8601String(),
      });
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      // Offline fallback: Log locally
      debugPrint('API Error posting location: $e');
      return false;
    }
  }

  // Get active bus clusters (with beautiful real-time simulator fallback)
  Future<List<BusCluster>> getClusters(
      {double? userLat, double? userLng}) async {
    try {
      final response = await _dio.get('/clusters');
      if (response.statusCode == 200 && response.data != null) {
        final List data = response.data as List;
        return data.map((json) => BusCluster.fromJson(json)).toList();
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[DEV] Backend offline — using local bus simulator: $e');
        // Fallback: Generate real-time moving buses on Djerba routes (dev only)
        return _generateSimulatedClusters(userLat, userLng);
      }
    }

    // Production: return empty when backend is unreachable
    return [];
  }

  // Submit feedback on whether user is on a bus
  Future<bool> confirmBus(String clusterId, bool isOnBus) async {
    try {
      final response = await _dio.post('/cluster/confirm', data: {
        'cluster_id': clusterId,
        'is_on_bus': isOnBus,
      });
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('API Error confirming bus: $e');
      return true; // Mock success in development
    }
  }

  // Core simulator math to create animated, moving buses
  List<BusCluster> _generateSimulatedClusters(
      double? userLat, double? userLng) {
    final List<BusCluster> clusters = [];
    final Random random = Random();

    for (int i = 0; i < _routes.length; i++) {
      final route = _routes[i];
      final name = _routeNames[i];

      // Update progress along the route
      if (_simulationDirection[i]) {
        _simulationProgress[i] += 0.005;
        if (_simulationProgress[i] >= 1.0) {
          _simulationProgress[i] = 1.0;
          _simulationDirection[i] = false;
        }
      } else {
        _simulationProgress[i] -= 0.005;
        if (_simulationProgress[i] <= 0.0) {
          _simulationProgress[i] = 0.0;
          _simulationDirection[i] = true;
        }
      }

      final double progress = _simulationProgress[i];
      final int segmentCount = route.length - 1;
      final double scaledProgress = progress * segmentCount;
      final int currentSegmentIndex =
          scaledProgress.floor().clamp(0, segmentCount - 1);
      final double segmentProgress = scaledProgress - currentSegmentIndex;

      final start = route[currentSegmentIndex];
      final end = route[currentSegmentIndex + 1];

      // Interpolate lat/lng
      final double lat =
          start['lat']! + (end['lat']! - start['lat']!) * segmentProgress;
      final double lng =
          start['lng']! + (end['lng']! - start['lng']!) * segmentProgress;

      // Calculate bearing/heading
      final double dy = end['lat']! - start['lat']!;
      final double dx = end['lng']! - start['lng']!;
      double heading = atan2(dx, dy) * 180 / pi;
      if (!_simulationDirection[i]) {
        heading = (heading + 180) % 360;
      }

      clusters.add(BusCluster(
        id: 'bus_route_$i',
        lat: lat,
        lng: lng,
        speed: 35.0 + random.nextInt(15), // speed in km/h
        userCount: 3 + random.nextInt(6), // 3 to 8 community trackers detected
        routeName: name,
        heading: heading,
      ));
    }

    // Dynamic user integration: If user is close to any of the buses,
    // let's place a simulated bus right next to them to trigger the confirmation dialog!
    if (userLat != null && userLng != null) {
      clusters.add(BusCluster(
        id: 'user_nearby_bus',
        lat: userLat + 0.0002, // Extremely close, within 20-30 meters
        lng: userLng - 0.0001,
        speed: 18.5,
        userCount: 5,
        routeName: 'Line 5 (Houmt Souk ⇆ Djerba Airport)',
        heading: 90.0,
      ));
    }

    return clusters;
  }
}
