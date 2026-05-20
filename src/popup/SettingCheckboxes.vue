<template>
    <div class="setting-toggles">
        <template
            v-for="item in items"
            :key="item.ref"
        >
            <label class="setting-toggles-item">
                <input
                    v-model="itemValues[item.settingKey]"
                    type="checkbox"
                >

                <span :title="item.title">{{ item.label }}</span>
            </label>
        </template>
    </div>
</template>

<script
    lang="ts"
    setup
>
    import {
        onMounted,
        ref,
        watch,
    } from 'vue';

    interface SettingItem {
        ref?: string,
        settingKey: string,
        label: string,
        title?: string,
    }

    interface Props {
        items: Array<SettingItem>,
    }

    const props = defineProps<Props>();

    const itemValues = ref({});

    onMounted(() => {
        const settingKeys = props.items.map((item) => item.settingKey);
        chrome.storage.local.get(settingKeys, (result: any) => {
            settingKeys.forEach((settingKey) => {
                itemValues.value[settingKey] = !!result?.[settingKey];
            });
        });
    });

    watch(itemValues, (newValue) => {
        Object.keys(newValue)
            .forEach((key) => {
                chrome.storage.local.set({ [key]: newValue[key] });
            });
    }, { deep: true });
</script>

<style scoped>
    div {
        display: flex;
    }

    label {
        display: flex;
        font-size: 16px;
        line-height: 32px;
        font-weight: bold;
    }

    input {
        width: 16px;
        margin-right: 8px;
        border-color: transparent;
        border-radius: 4px;
    }

    .setting-toggles-item {
        line-height: 32px;
        font-weight: normal;
        user-select: none;
        cursor: pointer;
    }
</style>
