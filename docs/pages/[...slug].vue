<script setup lang="ts">
definePageMeta({
  layout: 'docs',
})
const route = useRoute()

const { data: page } = await useAsyncData(`docs-${route.path}`, () => queryContent(route.path).findOne())
if (!page.value)
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })

const { data: surround } = await useAsyncData(`docs-${route.path}-surround`, () => queryContent()
  .where({ _extension: 'md', navigation: { $ne: false } })
  .findSurround(route.path.endsWith('/') ? route.path.slice(0, -1) : route.path),
)
const isProvider = page.value._path.startsWith('/providers')

useSeoMeta({
  titleTemplate: isProvider ? '%s - Nuxt Image Providers' : '%s - Nuxt Image',
  title: page.value.title,
  ogTitle: `${page.value.title} - ${isProvider ? 'Nuxt Image Providers' : 'Nuxt Image'}`,
  description: page.value.description,
  ogDescription: page.value.description,
})

defineOgImageComponent('Docs', {
  title: page.value.title,
  description: page.value.description,
  image: isProvider ? `${page.value._path}.svg` : '',
})

const headline = computed(() => findPageHeadline(page.value))
const communityLinks = computed(() => [
  {
    icon: 'i-ph-pen-duotone',
    label: 'Edit this page',
    to: `https://github.com/nuxt/image/edit/main/docs/content/${page?.value?._file}`,
    target: '_blank',
  },
  {
    icon: 'i-ph-shooting-star-duotone',
    label: 'Star on GitHub',
    to: 'https://github.com/nuxt/image',
    target: '_blank',
  },
  {
    icon: 'i-ph-chat-centered-text-duotone',
    label: 'Chat on Discord',
    to: 'https://chat.nuxt.dev',
    target: '_blank',
  },
  {
    icon: 'i-ph-hand-heart-duotone',
    label: 'Become a Sponsor',
    to: 'https://github.com/sponsors/nuxt',
    target: '_blank',
  },
  {
    icon: 'i-simple-icons-nuxtdotjs',
    label: 'Nuxt docs',
    to: 'https://nuxt.com',
    target: '_blank',
  },
])
</script>

<template>
  <UPage>
    <UPageHeader
      :title="page.title"
      :description="page.description"
      :links="page.links"
      :headline="headline"
    />

    <UPageBody
      prose
      class="pb-0"
    >
      <ContentRenderer
        v-if="page.body"
        :value="page"
      />
      <hr
        v-if="surround?.length"
        class="my-8"
      >
      <UContentSurround :surround="surround" />
    </UPageBody>

    <template
      v-if="page.body?.toc?.links?.length"
      #right
    >
      <UContentToc :links="page.body.toc.links">
        <template #bottom>
          <div class="hidden lg:block space-y-6 !mt-6">
            <UDivider
              v-if="page.body?.toc?.links?.length"
              type="dashed"
            />
            <UPageLinks
              title="Community"
              :links="communityLinks"
            />
            <UDivider type="dashed" />
            <AdsCarbon />
          </div>
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>
