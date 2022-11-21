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
export default {
  methods: {
    routePush(routeName) {
      this.$router.push({ name: routeName });
    },
  },
};
</script>
