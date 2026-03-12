import { View, Text } from "react-native";
import { UniversalLiquidCard } from "../components/UniversalLiquidCard";

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      {/* Background mesh blob (web only — kept simple for now) */}
      <View className="absolute w-[400px] h-[400px] rounded-full bg-forest-100 opacity-40 blur-3xl -top-20 -left-20" />
      <View className="absolute w-[300px] h-[300px] rounded-full bg-forest-200 opacity-30 blur-3xl bottom-10 right-0" />

      <UniversalLiquidCard variant="elevated" className="w-full max-w-sm p-card">
        <Text className="text-2xl font-bold text-primary text-center mb-2">
          MyHealthPal
        </Text>
        <Text className="text-base text-forest-700 text-center leading-6">
          Your biometrics, your story, your proof.
        </Text>
      </UniversalLiquidCard>

      <UniversalLiquidCard
        variant="active"
        pressable
        className="w-full max-w-sm mt-6 p-card"
      >
        <Text className="text-lg font-semibold text-accent text-center">
          Get Started
        </Text>
      </UniversalLiquidCard>
    </View>
  );
}
