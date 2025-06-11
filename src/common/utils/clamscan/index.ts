import NodeClam from 'clamscan';

// Initialize Clamscan with ClamAV daemon settings
export const clamscan = await new NodeClam().init({
	clamdscan: {
		host: 'localhost',
		port: 3310,
		timeout: 60_000,
	},
});
