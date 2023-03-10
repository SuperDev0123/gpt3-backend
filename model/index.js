const File = require('./File')
const Information = require('./Information')
const Url = require('./Url')


File.hasMany(Information, { foreignKey: 'file_id', as: 'informations' });
Information.belongsTo(File, {
    foreignKey: 'file_id',
    onDelete: 'CASCADE'
});

module.exports = {
    File,
    Information,
    Url,
}