function FileTransferPanel({ fileTransfers, onSendFile, onClose }) {
  try {
    const [dragging, setDragging] = React.useState(false);
    const fileInputRef = React.useRef(null);

    const handleDragOver = (e) => {
      e.preventDefault();
      setDragging(true);
    };

    const handleDragLeave = () => {
      setDragging(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      files.forEach(file => onSendFile(file));
    };

    const handleFileSelect = (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => onSendFile(file));
      e.target.value = '';
    };

    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
      <div className="h-full flex flex-col glass-effect" data-name="file-transfer-panel" data-file="components/FileTransferPanel.js">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">File Transfer</h3>
          <button onClick={onClose} className="w-8 h-8 rounded flex items-center justify-center hover:bg-[var(--dark-surface)] transition-colors">
            <div className="icon-x text-lg"></div>
          </button>
        </div>

        <div className="p-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragging ? 'border-[var(--primary-color)] bg-[var(--primary-color)] bg-opacity-10' : 
              'border-gray-600 hover:border-gray-500'
            }`}
          >
            <div className="w-16 h-16 bg-white bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="icon-upload text-3xl text-[var(--primary-color)]"></div>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-1">Drag and drop files here</p>
            <p className="text-xs text-[var(--text-secondary)]">or click to browse</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {fileTransfers.map((transfer) => (
            <div key={transfer.id} className="bg-[var(--dark-surface)] rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-10 rounded flex items-center justify-center flex-shrink-0">
                  <div className="icon-file text-lg text-[var(--primary-color)]"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{transfer.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{formatFileSize(transfer.size)}</p>
                  {transfer.status === 'sending' && (
                    <div className="mt-2">
                      <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--primary-color)] transition-all" style={{ width: `${transfer.progress}%` }}></div>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{transfer.progress}%</p>
                    </div>
                  )}
                  {transfer.status === 'completed' && !transfer.downloadUrl && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="icon-circle-check text-sm text-green-500"></div>
                      <span className="text-xs text-green-500">Sent</span>
                    </div>
                  )}
                  {transfer.status === 'completed' && transfer.downloadUrl && (
                    <a 
                      href={transfer.downloadUrl} 
                      download={transfer.name}
                      className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-[var(--primary-color)] hover:bg-opacity-80 rounded text-xs transition-colors"
                    >
                      <div className="icon-download text-sm"></div>
                      Download
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('FileTransferPanel component error:', error);
    return null;
  }
}

