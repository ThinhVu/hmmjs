describe('executor', () => {
  it('sql driver', () => {
    const someNativeDriver = {
      execQry (qry) {
        return `exec query ${qry.trim()}`
      },
      execNonQry(nonQry) {
        return `exec non query ${nonQry.trim()}`
      }
    }

    const makeEntity = (table) => {
      let qry = '';
      return {
        $() {
          let q = qry;
          qry = '';
          return someNativeDriver.execQry(q)
        },
        $$() {
          let q = qry;
          qry = '';
          return someNativeDriver.execNonQry(q)
        },
        select(cols) {
          const projection = typeof cols === 'string' ? cols : cols.join(', ')
          qry += `SELECT ${projection} from ${table}
`;
          return this;
        },
        where(condition) {
          qry +=
`WHERE ${condition}
`;
          return this;
        }
      }
    }
    const sqlDriver = {
      user: makeEntity('user')
    }

    const rs = sqlDriver.user.select(['fullName', 'username']).where('age > 10').$()
    expect(rs).toBe('exec query SELECT fullName, username from user\n' +
        'WHERE age > 10')
  })
})
