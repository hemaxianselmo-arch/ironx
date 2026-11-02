import { Stack } from "expo-router";
import { C } from "../../theme/tokens";
export default () => <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: "slide_from_bottom" }} />;
