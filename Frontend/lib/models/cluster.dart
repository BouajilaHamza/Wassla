class BusCluster {
  final String id;
  final double lat;
  final double lng;
  final double speed;
  final int userCount;
  final String routeName;
  final double heading;
  bool isConfirmed;

  BusCluster({
    required this.id,
    required this.lat,
    required this.lng,
    required this.speed,
    required this.userCount,
    required this.routeName,
    this.heading = 0.0,
    this.isConfirmed = false,
  });

  factory BusCluster.fromJson(Map<String, dynamic> json) {
    return BusCluster(
      id: json['id'] as String? ?? '',
      lat: (json['lat'] as num?)?.toDouble() ?? 0.0,
      lng: (json['lng'] as num?)?.toDouble() ?? 0.0,
      speed: (json['speed'] as num?)?.toDouble() ?? 0.0,
      userCount: json['user_count'] as int? ?? 1,
      routeName: json['route_name'] as String? ?? 'Line 1 (Houmt Souk)',
      heading: (json['heading'] as num?)?.toDouble() ?? 0.0,
      isConfirmed: json['is_confirmed'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'lat': lat,
      'lng': lng,
      'speed': speed,
      'user_count': userCount,
      'route_name': routeName,
      'heading': heading,
      'is_confirmed': isConfirmed,
    };
  }
}
