<template>
  <main>
    <div>
      <h1
        class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10"
      >
        Welcome
      </h1>
      <br />

      <br />
      <div class="flex flex-col col-span-2">
        <table class="min-w-full shadow-md rounded">
          <thead class="bg-gray-50 text-xl">
            <tr>
              <th class="p-4 text-center">Event Name</th>
              <th class="p-4 text-center">
                Event Sign-ups Last 2 Months
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr v-for="item in nameCount" :key="item._id">
              <td class="p-2 text-center">{{ item.event.eventName }}</td>
              <td class="p-2 text-center">{{ item.count }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <br />
      <div class="m-12">
        <h1>Graph</h1>

        <Bar
          :chart-options="chartOptions"
          :chart-data="chartData"
          :chart-id="chartId"
          :dataset-id-key="datasetIdKey"
          :plugins="plugins"
          :css-classes="cssClasses"
          :styles="styles"
          width="10px"
          height="200px"
        />
      </div>
    </div>
  </main>
</template>
<script>
import axios from "axios";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

export default {
  data() {
    return {
      nameCount: [],
      chartData: {
        labels: [],
        datasets: [],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
      },
    };
  },
  components: { Bar },
  props: {
    chartId: {
      type: String,
      default: "bar-chart",
    },
    datasetIdKey: {
      type: String,
      default: "label",
    },
    width: {
      type: Number,
      default: 50,
    },
    height: {
      type: Number,
      default: 100,
    },
    cssClasses: {
      default: "",
      type: String,
    },
    styles: {
      type: Object,
      default: () => {},
    },
    plugins: {
      type: Object,
      default: () => {},
    },
  },

  mounted() {
    this.findEventCount();
  },
  methods: {
    async findEventCount() {
      let apiURL = import.meta.env.VITE_ROOT_API + `/eventdata/event-by-date`;
      const { data } = await axios.get(apiURL);
      this.nameCount = data;

      //generating table and chart data
      this.chartData.labels = data.map((x) => x.event.eventName);
      const x = data.map((x) => x.count);
      let obj = { label: "Count", backgroundColor: "#f87979", data: x };
      this.chartData.datasets.push(obj);
    },
    routePush(routeName) {
      this.$router.push({ name: routeName });
    },
  },
};
</script>
