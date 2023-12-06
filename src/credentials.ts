export const getCredentials = ()=>{
    const azureKey  = "your-key";
    const containerName = "credentials-content";
    return {
        azureKey,
        containerName
    }
}