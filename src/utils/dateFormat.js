const toBrazilianFormat = () => {
    let datetime = new Date()
    datetime = datetime.toLocaleString('GMT')
    datetime = datetime.split(' ')
    date = datetime[0]
    time = datetime[1]
    date = date.split('-').reverse().join('/')
    datetime = [ date, time ].join(' ')
    return datetime
}

module.exports = toBrazilianFormat