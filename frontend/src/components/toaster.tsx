import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from "@chakra-ui/react"

export const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
})

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
        {(toast) => (
          <Toast.Root 
            width={{ md: "sm" }}
            bg={toast.type === "error" ? "red.600" : toast.type === "success" ? "green.600" : "gray.600"}
            color="white"
          >
            {toast.type === "loading" ? (
              <Spinner size="sm" color="blue.500" />
            ) : (
              <Toast.Indicator color={toast.type === "error" ? "red.500" : "green.500"} />
            )}
            <Stack gap="1" flex="1" maxWidth="100%">
              {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
              {toast.description && (
                <Toast.Description>{toast.description}</Toast.Description>
              )}
            </Stack>
            {toast.action && (
              <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
            )}
            {toast.closable && (
              <Toast.CloseTrigger 
                color="gray.400"
                p="1"
                _hover={{ 
                  bg: "gray.700",
                  color: "white"
                }}
              />
            )}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  )
}
