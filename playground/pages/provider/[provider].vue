<template>
  <div>
    <div v-if="provider">
      <h1>{{ provider.name }}</h1>
      <br>
      <div class="providerShowcase">
        <div
          v-for="sample of provider.samples"
          :key="sample.src"
        >
          <nuxt-img
            :provider="provider.name as any"
            v-bind="sample"
            :preload="{ fetchPriority: 'auto' }"
          />
          <pre>{{ sample }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { providers } from '../../providers'

definePageMeta({
  validate({ params }) {
    return Boolean(providers.find(p => p.name === params.provider))
  },
})

const route = useRoute()
const provider = computed(() => {
  const providerName = route.params.provider || 'default'
  const p = providers.find(p => p.name === providerName)
  if (!p) {
    return null
  }
  return p
})

if (route.params.provider === 'ipx') {
  useImage().getImage('/images/nuxt.png')
}
</script>

<style scoped>
img {
  max-width: 80vw;
  height: auto;
}
</style>
