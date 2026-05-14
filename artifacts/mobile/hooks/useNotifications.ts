import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function notifyClusterDetected(clusterId: string): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Are you on a bus?",
      body: "You appear to be moving with a group of people. Tap to confirm and earn +10 points.",
      data: { clusterId },
      categoryIdentifier: "BUS_CONFIRM",
    },
    trigger: null,
  });
}

export async function notifyBusConfirmed(points: number): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Bus confirmed! +10 pts",
      body: `You now have ${points} points. Thanks for helping map Djerba's buses.`,
      data: {},
    },
    trigger: null,
  });
}

export async function notifyDismissed(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.dismissAllNotificationsAsync();
}
