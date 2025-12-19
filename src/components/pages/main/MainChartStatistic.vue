<script setup lang="ts">
import { MainProfitDto } from "@/services/main/dto/main.dto";
import { getPieChartProfit } from "@/services/main/main.service";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const monthNames = [
  t('months.jan'),
  t('months.feb'),
  t('months.mar'),
  t('months.apr'),
  t('months.may'),
  t('months.jun'),
  t('months.jul'),
  t('months.aug'),
  t('months.sep'),
  t('months.oct'),
  t('months.nov'),
  t('months.dec')
];

const profitList = ref<MainProfitDto[]>([]);

const computetSeries = computed(() => {
  return [{
    name: "Desktops",
    data: profitList.value.map(item => parseFloat(item.summa?.toFixed(0)) || 0)
  }];
});

const chartOptionsComputed = computed(() => {
  return {
    chart: { height: 350, type: 'line', zoom: { enabled: true } },
    dataLabels: { enabled: false },
    colors: ['#00bcd4'],
    stroke: { curve: 'straight' },
    grid: { row: { colors: ['#f3f3f3', '#FFF'], opacity: 0.5 } },
    xaxis: {
      categories: profitList.value.map(item => {
        const monthIndex = item.month_number ? item.month_number - 1 : -1;
        return monthIndex >= 0 && monthIndex < 12 ? monthNames[monthIndex] : "Unknown";
      })
    }
  };
});

const fetchData = async () => {
  try {
    const { data: { result } } = await getPieChartProfit();
    profitList.value = result.filter(item => item.summa && item.month_number >= 1 && item.month_number <= 12) || [];
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <div id="chart" v-if="profitList.length > 0">
    <apexchart type="line" height="350" :options="chartOptionsComputed" :series="computetSeries" />
  </div>
  <div v-else class="h-[350px]" style="height: 350px; display: flex; align-items: center; justify-content: center;">
    <v-progress-circular class="progress-circ" indeterminate></v-progress-circular>
  </div>
</template>

<style scoped>
body.dark-theme {
  .overlay {
    background-color: rgba(66, 66, 66, 0.5);
  }

  .progress-circ {
    color: #fff
  }
}

.progress-circ {
  color: #7e57c2
}
</style>
