<script lang="ts">
  import * as Accordion from '$lib/components/ui/accordion';
  import Icon from '@iconify/svelte';
  import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';
  import { fileData, type Container } from '$lib/data/fileData';
  import '../styles/dnd.css';

  export let containers: Container[] = fileData;
  export let level: number = 0;
  export let parentContainerId: string | null = null;

  let selectedContainer: Container | null = null;
  let showDialog = false;
  let openItems: string[] = [];

  interface Item {
    itemName: string;
    itemId?: string;
  }

  function getIcon(container: Container, level: number): string {
    if (container.containerName.toLowerCase().includes('box')) {
      return level % 2 === 0 
        ? "mdi:checkbox-indeterminate" 
        : "mdi:checkbox-indeterminate-outline";
    }
    return level % 2 === 0 ? "mdi:folder" : "mdi:folder-outline";
  }

  function getItemIcon(level: number): string {
    return level % 2 === 0 ? "mdi:file" : "mdi:file-outline";
  }

  function handleContainerDrop(state: DragDropState<any>) {
    const { draggedItem, sourceContainer, targetContainer } = state;
    if (!draggedItem || !targetContainer) return;
    
    console.log("Dropping:", { draggedItem, sourceContainer, targetContainer });
    
    if ("containerName" in draggedItem) {
      let sourceList;
      if (sourceContainer === 'root') {
        sourceList = containers;
      } else {
        const sourceParent = findContainerById(containers, sourceContainer);
        if (!sourceParent || !sourceParent.additionalContainers) return;
        sourceList = sourceParent.additionalContainers;
      }
      const idx = sourceList.findIndex(c => c.containerName === draggedItem.containerName);
      if (idx === -1) return;
      const containerToMove = sourceList.splice(idx, 1)[0];

      let targetList;
      if (targetContainer === 'root') {
        targetList = containers;
      } else {
        const targetParent = findContainerById(containers, targetContainer);
        if (!targetParent) return;
        if (!targetParent.additionalContainers) targetParent.additionalContainers = [];
        targetList = targetParent.additionalContainers;
      }
      targetList.push(containerToMove);
    }
    else if ("itemName" in draggedItem) {
      const sourceParent = findContainerById(containers, sourceContainer);
      if (!sourceParent || !sourceParent.items) return;
      const idx = sourceParent.items.findIndex(i => i.itemName === draggedItem.itemName);
      if (idx === -1) return;
      const itemToMove = sourceParent.items.splice(idx, 1)[0];

      const targetParent = findContainerById(containers, targetContainer);
      if (!targetParent) return;
      if (!targetParent.items) targetParent.items = [];
      targetParent.items.push(itemToMove);
    }
    
    containers = [...containers];
  }

  function findContainerById(containerList: Container[], id: string): Container | null {
    for (const container of containerList) {
      if (container.containerName === id) {
        return container;
      }
      if (container.additionalContainers && container.additionalContainers.length > 0) {
        const found = findContainerById(container.additionalContainers, id);
        if (found) return found;
      }
    }
    return null;
  }

  function handleValueChange(value: string) {
    if (openItems.includes(value)) {
      openItems = openItems.filter(item => item !== value);
    } else {
      openItems = [...openItems, value];
    }
  }

  function openInfoDialog(container: Container, event: MouseEvent) {
    event.stopPropagation();
    selectedContainer = container;
    showDialog = true;
  }

  function handleClick(event: MouseEvent) {
    event.stopPropagation();
  }
</script>

<div class="file-tree-container">
  <div class="file-tree" style="padding-left: {level > 0 ? '1.25rem' : '0'}"
    use:droppable={{
      container: 'root',
      callbacks: { onDrop: handleContainerDrop },
      attributes: {
        dragOverClass: 'drag-over'
      }
    }}
  >
    {#each containers as container}
      <div
        class="container-wrapper"
        use:draggable={{ 
          container: parentContainerId || 'root', 
          dragData: container,
          dragHandle: '.drag-handle',
          attributes: {
            draggingClass: 'dragging'
          }
        }}
        use:droppable={{
          container: container.containerName,
          callbacks: { onDrop: handleContainerDrop },
          attributes: {
            dragOverClass: 'drag-over'
          }
        }}
      >
        <Accordion.Root value={openItems} onValueChange={handleValueChange}>
          <Accordion.Item value={container.containerName} class="no-border">
            <div class="item-header">
              <div 
                class="drag-handle"
                on:click|stopPropagation
              >
                ⋮
              </div>
              <Accordion.Trigger class="accordion-trigger">
                <div class="trigger-content">
                  <Icon icon={getIcon(container, level)} width="20" height="20" />
                  <span class="container-name">{container.containerName}</span>
                </div>
              </Accordion.Trigger>
              {#if container.hasInfo}
                <button 
                  class="info-button" 
                  on:click={(e) => openInfoDialog(container, e)}
                  aria-label="Show information"
                >
                  <Icon icon="mdi:information-outline" width="20" height="20" />
                </button>
              {/if}
            </div>
            <Accordion.Content class="accordion-content">
              <div class="content-wrapper">
                {#if container.additionalContainers?.length}
                  <svelte:self 
                    containers={container.additionalContainers} 
                    level={level + 1} 
                    parentContainerId={container.containerName}
                  />
                {/if}
                {#if container.items?.length}
                  <div class="items-list">
                    {#each container.items as item}
                      <div 
                        class="item"
                        use:draggable={{ 
                          container: container.containerName, 
                          dragData: item,
                          attributes: {
                            draggingClass: 'dragging'
                          }
                        }}
                      >
                        <Icon icon={getItemIcon(level)} width="20" height="20" />
                        <span class="item-name">{item.itemName}</span>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </div>
    {/each}
  </div>
</div>

{#if showDialog}
  <div class="dialog-overlay" on:click={() => showDialog = false}>
    <div class="dialog-content" on:click={handleClick}>
      <h2 class="dialog-title">{selectedContainer?.containerName}</h2>
      <p class="dialog-path">Location: {selectedContainer?.containerLocation.path}</p>
      <div class="dialog-body">
        <!-- Additional content can be added here -->
      </div>
      <button class="close-button" on:click={() => showDialog = false}>Close</button>
    </div>
  </div>
{/if}

<style>
  .file-tree-container {
    width: 100%;
    padding: 0.5rem;
  }

  .file-tree {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    width: 100%;
  }

  .container-wrapper {
    position: relative;
    width: 100%;
    border: 1px solid transparent;
    border-radius: 4px;
    margin-bottom: 2px;
  }

  .drag-handle {
    cursor: grab;
    padding: 0 8px;
    font-size: 18px;
    color: #666;
    user-select: none;
  }

  .drag-handle:active {
    cursor: grabbing;
  }

  .item-header {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 4px 0;
  }

  .trigger-content {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    cursor: pointer;
    padding: 4px 0;
  }

  :global(.accordion-trigger) {
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    pointer-events: auto;
  }

  :global(.accordion-trigger:hover) {
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }

  .container-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    line-height: 1.5;
  }

  .content-wrapper {
    position: relative;
    padding-left: 0.25rem;
    border-left: 1px solid #666;
    margin-left: 0.625rem;
  }

  .info-button {
    background: none;
    border: none;
    color: #666;
    padding: 0;
    margin-left: 0.25rem;
    font-size: 1rem;
    cursor: pointer;
    line-height: 1;
  }

  .dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .dialog-content {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    width: min(500px, 90vw);
    max-height: 90vh;
    overflow-y: auto;
  }

  .dialog-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
  }

  .dialog-path {
    margin: 0;
    color: #666;
  }

  .dialog-body {
    min-height: 200px;
    margin: 1rem 0;
  }

  .close-button {
    background: #e5e7eb;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  :global(.no-border) {
    border: none !important;
  }

  :global(.accordion-content) {
    padding: 0;
  }

  @media (max-width: 640px) {
    .file-tree {
      font-size: 16px;
    }
    .info-button {
      font-size: 1.25rem;
    }
    .dialog-content {
      width: 90vw;
      margin: 1rem;
    }
  }

  .items-list {
    margin-top: 0.25rem;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.125rem 0;
    margin-bottom: 2px;
    cursor: grab;
    border: 1px solid transparent;
    border-radius: 4px;
  }

  .item:active {
    cursor: grabbing;
  }

  .item-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    line-height: 1.5;
  }

  :global(.dragging) {
    opacity: 0.8;
    background-color: rgba(0, 0, 0, 0.03);
    border: 1px dashed #666;
  }

  :global(.drag-over) {
    border: 1px dashed #4a90e2;
    background-color: rgba(74, 144, 226, 0.05);
  }

  @media (pointer: coarse) {
    .drag-handle {
      padding: 0 12px;
      font-size: 22px;
    }
    .item-header {
      padding: 8px 0;
    }
    .trigger-content {
      padding: 8px 0;
    }
    :global(.accordion-trigger) {
      padding: 8px;
    }
    .info-button {
      padding: 8px;
      margin-left: 8px;
    }
    .item {
      padding: 8px 0;
    }
  }
</style>
